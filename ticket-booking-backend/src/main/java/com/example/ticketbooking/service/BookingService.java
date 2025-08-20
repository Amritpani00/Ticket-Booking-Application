package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.BookingDtos;
import com.example.ticketbooking.model.Booking;
import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import com.razorpay.Order;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final PaymentService paymentService;

    @Transactional
    public BookingDtos.CreateBookingResponse createBooking(BookingDtos.CreateBookingRequest request) throws Exception {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        List<Seat> lockedSeats = seatRepository.lockSeatsByIds(request.getSeatIds());
        if (lockedSeats.size() != request.getSeatIds().size()) {
            throw new IllegalArgumentException("One or more seats not found");
        }
        for (Seat seat : lockedSeats) {
            if (!seat.getEvent().getId().equals(event.getId())) {
                throw new IllegalArgumentException("Seat does not belong to event");
            }
            if (seat.getStatus() != Seat.Status.AVAILABLE) {
                throw new IllegalStateException("Seat not available: " + seat.getId());
            }
        }

        BigDecimal total = event.getSeatPrice().multiply(BigDecimal.valueOf(lockedSeats.size()));

        Booking booking = new Booking();
        booking.setEvent(event);
        booking.setSeats(new HashSet<>(lockedSeats));
        booking.setCustomerName(request.getCustomerName());
        booking.setCustomerEmail(request.getCustomerEmail());
        booking.setCustomerPhone(request.getCustomerPhone());
        booking.setTotalAmount(total);
        booking.setStatus(Booking.Status.PENDING_PAYMENT);
        booking.setCreatedAt(OffsetDateTime.now());
        booking.setReservationExpiresAt(OffsetDateTime.now().plusMinutes(10));
        booking = bookingRepository.save(booking);

        for (Seat seat : lockedSeats) {
            seat.setStatus(Seat.Status.RESERVED);
        }

        long amountInPaise = total.multiply(BigDecimal.valueOf(100)).longValue();
        Order order = paymentService.createOrder(amountInPaise, "booking-" + booking.getId());
        booking.setPaymentOrderId(order.get("id"));

        Booking saved = bookingRepository.save(booking);

        return BookingDtos.CreateBookingResponse.builder()
                .bookingId(saved.getId())
                .orderId(saved.getPaymentOrderId())
                .razorpayKeyId(paymentService.getKeyId())
                .amount(saved.getTotalAmount())
                .currency("INR")
                .build();
    }

    @Transactional
    public Booking confirmPayment(BookingDtos.VerifyPaymentRequest request) throws Exception {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getPaymentOrderId().equals(request.getRazorpayOrderId())) {
            throw new IllegalArgumentException("OrderId mismatch");
        }

        boolean ok = paymentService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );
        if (!ok) {
            throw new IllegalArgumentException("Invalid payment signature");
        }

        booking.setRazorpayPaymentId(request.getRazorpayPaymentId());
        booking.setRazorpaySignature(request.getRazorpaySignature());
        booking.setStatus(Booking.Status.CONFIRMED);

        Set<Seat> seats = booking.getSeats();
        for (Seat seat : seats) {
            seat.setStatus(Seat.Status.BOOKED);
        }

        return bookingRepository.save(booking);
    }

    public Optional<Booking> findById(Long id) {
        return bookingRepository.findById(id);
    }
}
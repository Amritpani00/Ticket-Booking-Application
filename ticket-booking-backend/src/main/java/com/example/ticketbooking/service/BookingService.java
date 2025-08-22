package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.BookingDtos;
import com.example.ticketbooking.model.Booking;
import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.model.BookingPassenger;
import com.example.ticketbooking.model.PNR;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import com.example.ticketbooking.repository.PNRRepository;
import com.razorpay.Order;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

	private final EventRepository eventRepository;
	private final SeatRepository seatRepository;
	private final BookingRepository bookingRepository;
	private final PaymentService paymentService;
	private final PNRRepository pnrRepository;
	private final SeatUpdateBroadcaster seatUpdateBroadcaster;

	@Transactional
	public BookingDtos.CreateBookingResponse createBooking(BookingDtos.CreateBookingRequest request) throws Exception {
		Event event = eventRepository.findById(request.getEventId())
				.orElseThrow(() -> new EntityNotFoundException("Event not found"));

		List<Long> requestedSeatIds = request.getSeatIds() == null ? java.util.List.of() : request.getSeatIds();
		List<Seat> lockedSeats = requestedSeatIds.isEmpty() ? java.util.List.of() : seatRepository.lockSeatsByIds(requestedSeatIds);
		if (!requestedSeatIds.isEmpty() && lockedSeats.size() != requestedSeatIds.size()) {
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

		int passengerCount = request.getPassengers() == null ? 0 : request.getPassengers().size();
		// Auto-assign seats if none provided
		if (lockedSeats.isEmpty() && passengerCount > 0) {
			List<Seat> eventSeats = seatRepository.findByEvent_Id(event.getId());
			List<Seat> availableSeats = eventSeats.stream().filter(s -> s.getStatus() == Seat.Status.AVAILABLE).limit(passengerCount).toList();
			if (availableSeats.size() == passengerCount) {
				lockedSeats = availableSeats;
				// no pessimistic lock for simplicity here
			}
		}

		BigDecimal total = event.getSeatPrice().multiply(BigDecimal.valueOf(Math.max(lockedSeats.size(), passengerCount)));

		Booking booking = new Booking();
		booking.setEvent(event);
		booking.setSeats(new HashSet<>(lockedSeats));
		booking.setCustomerName(request.getCustomerName());
		booking.setCustomerEmail(request.getCustomerEmail());
		booking.setCustomerPhone(request.getCustomerPhone());
		// Parse and set journey date from validated YYYY-MM-DD string
		if (request.getJourneyDate() != null && !request.getJourneyDate().isBlank()) {
			booking.setJourneyDate(java.time.LocalDate.parse(request.getJourneyDate()));
		}
		booking.setTotalAmount(total);
		booking.setStatus(Booking.Status.PENDING_PAYMENT);
		booking.setCreatedAt(OffsetDateTime.now());
		booking.setReservationExpiresAt(OffsetDateTime.now().plusMinutes(10));
		booking = bookingRepository.save(booking);

		for (Seat seat : lockedSeats) { seat.setStatus(Seat.Status.RESERVED); }
		// Broadcast seat reservation updates
		if (!lockedSeats.isEmpty()) {
			seatUpdateBroadcaster.broadcastSeatStatus(event.getId(), lockedSeats);
		}

		// Save passengers; map seats if assigned
		if (request.getPassengers() != null) {
			for (int i = 0; i < request.getPassengers().size(); i++) {
				var p = request.getPassengers().get(i);
				Seat seat = i < lockedSeats.size() ? lockedSeats.get(i) : null;
				BookingPassenger bp = BookingPassenger.builder()
						.booking(booking)
						.name(p.getName())
						.age(p.getAge())
						.gender(p.getGender())
						.idProof(p.getIdProof())
						.seat(seat)
						.build();
				// Ensure cascading by attaching passenger to booking aggregate
				booking.getPassengers().add(bp);
			}
		}

		// Persist passengers before creating payment order so booking reflects full state
		booking = bookingRepository.save(booking);

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
				.reservationExpiresAt(saved.getReservationExpiresAt())
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

		// Create PNR if not exists
		Optional<PNR> existing = pnrRepository.findByBooking_Id(booking.getId());
		if (existing.isEmpty()) {
			PNR pnr = new PNR();
			pnr.setPnrNumber(generatePNR());
			pnr.setBooking(booking);
			pnr.setPnrGeneratedDate(LocalDateTime.now());
			Event e = booking.getEvent();
			pnr.setJourneyDate(e.getStartTime());
			pnr.setSourceStation(e.getSource());
			pnr.setDestinationStation(e.getDestination());
			pnr.setTrainNumber(e.getTrainNumber());
			pnr.setTrainName(e.getName());
			String classType = seats.stream().findFirst().map(s -> s.getCoach() != null ? s.getCoach().getClassType() : null).orElse(e.getClassType());
			pnr.setClassType(classType);
			pnr.setNumberOfPassengers(seats.size());
			pnr.setTotalFare(booking.getTotalAmount());
			pnr.setSeatNumbers(seats.stream().map(s -> s.getRowLabel() + s.getSeatNumber()).collect(Collectors.joining(",")));
			pnr.setCoachCodes(seats.stream().map(s -> s.getCoach() != null ? s.getCoach().getCode() : "").distinct().collect(Collectors.joining(",")));
			pnr.setDepartureTime(e.getStartTime());
			pnr.setArrivalTime(e.getEndTime());
			pnr.setStatus(PNR.PNRStatus.CONFIRMED);
			pnr.setChartStatus("Not Prepared");
			pnr.setPlatformNumber(e.getPlatformNumber());
			pnrRepository.save(pnr);
		}

		Booking savedBooking = bookingRepository.save(booking);
		// Broadcast seat booking updates
		if (seats != null && !seats.isEmpty()) {
			seatUpdateBroadcaster.broadcastSeatStatus(booking.getEvent().getId(), new java.util.ArrayList<>(seats));
		}
		return savedBooking;
	}

	public Optional<Booking> findById(Long id) {
		return bookingRepository.findByIdWithEventAndSeats(id);
	}

	private String generatePNR() {
		java.util.Random random = new java.util.Random();
		StringBuilder pnr = new StringBuilder();
		for (int i = 0; i < 10; i++) { pnr.append(random.nextInt(10)); }
		return pnr.toString();
	}
}
package com.example.ticketbooking;

import com.example.ticketbooking.dto.BookingDtos;
import com.example.ticketbooking.model.Booking;
import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import com.example.ticketbooking.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class BookingFlowTest {

    @Autowired
    BookingService bookingService;

    @Autowired
    EventRepository eventRepository;

    @Autowired
    SeatRepository seatRepository;

    @Autowired
    BookingRepository bookingRepository;

    @Test
    void fullFlow_create_and_verify() throws Exception {
        Event event = eventRepository.findAll().get(0);
        List<Long> seats = seatRepository.findByEvent_Id(event.getId()).stream()
                .limit(2)
                .map(s -> s.getId())
                .toList();
        BookingDtos.CreateBookingRequest req = new BookingDtos.CreateBookingRequest();
        req.setEventId(event.getId());
        req.setSeatIds(seats);
        req.setCustomerName("Test User");
        req.setCustomerEmail("test@example.com");
        req.setCustomerPhone("9999999999");

        var resp = bookingService.createBooking(req);
        assertThat(resp.getOrderId()).isNotBlank();
        assertThat(resp.getBookingId()).isNotNull();

        BookingDtos.VerifyPaymentRequest verify = new BookingDtos.VerifyPaymentRequest();
        verify.setBookingId(resp.getBookingId());
        verify.setRazorpayOrderId(resp.getOrderId());
        verify.setRazorpayPaymentId("pay_test_123");
        verify.setRazorpaySignature("sig_test");

        Booking confirmed = bookingService.confirmPayment(verify);
        assertThat(confirmed.getStatus()).isEqualTo(Booking.Status.CONFIRMED);
    }
}
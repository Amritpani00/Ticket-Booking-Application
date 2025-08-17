package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingDtos;
import com.example.ticketbooking.model.Booking;
import com.example.ticketbooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

	private final BookingService bookingService;

	@PostMapping
	public ResponseEntity<?> create(@Valid @RequestBody BookingDtos.CreateBookingRequest request) throws Exception {
		return ResponseEntity.ok(bookingService.createBooking(request));
	}

	@PostMapping("/verify")
	public ResponseEntity<?> verify(@Valid @RequestBody BookingDtos.VerifyPaymentRequest request) throws Exception {
		Booking booking = bookingService.confirmPayment(request);
		return ResponseEntity.ok(BookingDtos.BookingStatusResponse.builder()
				.bookingId(booking.getId())
				.status(booking.getStatus().name())
				.build());
	}
}
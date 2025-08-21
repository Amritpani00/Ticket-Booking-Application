package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingDtos;
import com.example.ticketbooking.model.Booking;
import com.example.ticketbooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

	@GetMapping("/{id}")
	@Transactional(readOnly = true)
	public ResponseEntity<?> get(@PathVariable Long id) {
		return bookingService.findById(id)
				.map(b -> ResponseEntity.ok(new Object() {
					public final Long bookingId = b.getId();
					public final String status = b.getStatus().name();
					public final String trainName = b.getEvent().getName();
					public final String trainNumber = b.getEvent().getTrainNumber();
					public final String source = b.getEvent().getSource();
					public final String destination = b.getEvent().getDestination();
					public final java.util.List<String> seatLabels = b.getSeats().stream().map(s -> s.getRowLabel() + s.getSeatNumber()).toList();
					public final java.math.BigDecimal totalAmount = b.getTotalAmount();
					public final java.time.OffsetDateTime createdAt = b.getCreatedAt();
				}))
				.orElse(ResponseEntity.notFound().build());
	}
}
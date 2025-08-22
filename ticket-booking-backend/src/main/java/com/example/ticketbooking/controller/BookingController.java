package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingDtos;
import com.example.ticketbooking.model.Booking;
import com.example.ticketbooking.model.PNR;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.PNRRepository;
import com.example.ticketbooking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

	private final BookingService bookingService;
	private final BookingRepository bookingRepository;
	private final PNRRepository pnrRepository;

	@PostMapping
	public ResponseEntity<BookingDtos.CreateBookingResponse> createBooking(@RequestBody BookingDtos.CreateBookingRequest request) {
		try {
			BookingDtos.CreateBookingResponse response = bookingService.createBooking(request);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@PostMapping("/verify")
	public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody BookingDtos.VerifyPaymentRequest request) {
		try {
			Booking booking = bookingService.confirmPayment(request);
			PNR pnr = pnrRepository.findByBooking_Id(booking.getId()).orElse(null);
			Map<String, Object> response = new HashMap<>();
			response.put("status", "PAYMENT_VERIFIED");
			response.put("message", "Payment verified successfully");
			response.put("bookingId", booking.getId());
			if (pnr != null) response.put("pnrNumber", pnr.getPnrNumber());
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	@GetMapping("/{bookingId}")
	public ResponseEntity<Map<String, Object>> getBooking(@PathVariable Long bookingId) {
		return bookingRepository.findByIdWithEventAndSeats(bookingId)
				.map(booking -> {
					List<String> seatLabels = booking.getSeats().stream()
							.map(s -> s.getRowLabel() + s.getSeatNumber())
							.collect(Collectors.toList());
					String status = booking.getStatus().name();
					if ("CANCELED".equals(status)) { status = "CANCELLED"; }
					PNR pnr = pnrRepository.findByBooking_Id(booking.getId()).orElse(null);
					Map<String, Object> response = new HashMap<>();
					response.put("bookingId", booking.getId());
					response.put("status", status);
					response.put("trainName", booking.getEvent().getName());
					response.put("trainNumber", booking.getEvent().getTrainNumber());
					response.put("source", booking.getEvent().getSource());
					response.put("destination", booking.getEvent().getDestination());
					response.put("seatLabels", seatLabels);
					response.put("totalAmount", booking.getTotalAmount());
					response.put("createdAt", booking.getCreatedAt());
					if (pnr != null) response.put("pnrNumber", pnr.getPnrNumber());
					return ResponseEntity.ok(response);
				})
				.orElse(ResponseEntity.notFound().build());
	}

	@GetMapping("/pnr/{pnrNumber}")
	public ResponseEntity<Map<String, Object>> getBookingByPNR(@PathVariable String pnrNumber) {
		return pnrRepository.findByPnrNumber(pnrNumber)
				.map(PNR::getBooking)
				.flatMap(b -> bookingRepository.findByIdWithEventAndSeats(b.getId()))
				.map(b -> {
					List<String> seatLabels = b.getSeats().stream()
							.map(s -> s.getRowLabel() + s.getSeatNumber())
							.collect(Collectors.toList());
					String status = b.getStatus().name();
					if ("CANCELED".equals(status)) { status = "CANCELLED"; }
					Map<String, Object> response = new HashMap<>();
					response.put("bookingId", b.getId());
					response.put("status", status);
					response.put("trainName", b.getEvent().getName());
					response.put("trainNumber", b.getEvent().getTrainNumber());
					response.put("source", b.getEvent().getSource());
					response.put("destination", b.getEvent().getDestination());
					response.put("seatLabels", seatLabels);
					response.put("totalAmount", b.getTotalAmount());
					response.put("createdAt", b.getCreatedAt());
					return ResponseEntity.ok(response);
				})
				.orElse(ResponseEntity.notFound().build());
	}
}
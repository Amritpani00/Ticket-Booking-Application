package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.Booking;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

	private final BookingRepository bookingRepository;
	private final PaymentService paymentService;

	@PostMapping("/retry/{bookingId}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> retry(@AuthenticationPrincipal User principal, @PathVariable Long bookingId) {
		return bookingRepository.findById(bookingId)
				.map(b -> {
					try {
						long amountInPaise = b.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
						var order = paymentService.createOrder(amountInPaise, "booking-" + b.getId());
						b.setPaymentOrderId(order.get("id"));
						bookingRepository.save(b);
						return ResponseEntity.ok(Map.of(
								"orderId", b.getPaymentOrderId(),
								"amount", b.getTotalAmount(),
								"currency", "INR",
								"razorpayKeyId", paymentService.getKeyId()
						));
					} catch (Exception e) {
						return ResponseEntity.internalServerError().body(Map.of("error", "PAYMENT_RETRY_FAILED", "message", e.getMessage()));
					}
				})
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping("/webhook/razorpay")
	public ResponseEntity<?> webhook(@RequestBody Map<String, Object> payload, @RequestHeader Map<String, String> headers) {
		// Placeholder for verifying webhook signature and updating booking status
		return ResponseEntity.ok(Map.of("received", true));
	}
}
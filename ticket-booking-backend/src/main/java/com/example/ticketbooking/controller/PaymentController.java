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
		try {
			String signature = headers.getOrDefault("x-razorpay-signature", headers.getOrDefault("X-Razorpay-Signature", ""));
			String body = new org.json.JSONObject(payload).toString();
			boolean ok = paymentService.verifyWebhookSignature(body, signature);
			if (!ok) {
				return ResponseEntity.status(401).body(Map.of("error", "INVALID_SIGNATURE"));
			}
			Map<String, Object> payloadData = (Map<String, Object>) payload.get("payload");
			if (payloadData == null) return ResponseEntity.badRequest().body(Map.of("error", "INVALID_PAYLOAD"));
			Map<String, Object> paymentEntity = (Map<String, Object>) payloadData.get("payment");
			if (paymentEntity == null) return ResponseEntity.badRequest().body(Map.of("error", "INVALID_PAYLOAD"));
			Map<String, Object> payment = (Map<String, Object>) paymentEntity.get("entity");
			if (payment == null) return ResponseEntity.badRequest().body(Map.of("error", "INVALID_PAYLOAD"));
			String orderId = (String) payment.get("order_id");
			String paymentId = (String) payment.get("id");
			if (orderId == null || paymentId == null) return ResponseEntity.badRequest().body(Map.of("error", "MISSING_IDS"));

			return bookingRepository.findByPaymentOrderId(orderId)
					.map(b -> {
						b.setRazorpayPaymentId(paymentId);
						b.setStatus(com.example.ticketbooking.model.Booking.Status.CONFIRMED);
						bookingRepository.save(b);
						return ResponseEntity.ok(Map.of("status", "BOOKING_CONFIRMED", "bookingId", b.getId()));
					})
					.orElse(ResponseEntity.notFound().build());
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
}
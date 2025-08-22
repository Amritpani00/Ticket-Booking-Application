package com.example.ticketbooking.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;

public class BookingDtos {

	@Getter
	@Setter
	public static class CreateBookingRequest {
		@NotNull
		private Long eventId;
		private List<Long> seatIds;
		@NotBlank
		private String customerName;
		@Email
		@NotBlank
		private String customerEmail;
		@NotBlank
		private String customerPhone;
		@NotBlank
		private String journeyDate; // YYYY-MM-DD
		@Size(min = 1)
		private List<Passenger> passengers;
	}

	@Getter
	@Setter
	@Builder
	public static class CreateBookingResponse {
		private Long bookingId;
		private String orderId;
		private String razorpayKeyId;
		private BigDecimal amount;
		private String currency;
	}

	@Getter
	@Setter
	public static class VerifyPaymentRequest {
		@NotNull
		private Long bookingId;
		@NotBlank
		private String razorpayOrderId;
		@NotBlank
		private String razorpayPaymentId;
		@NotBlank
		private String razorpaySignature;
	}

	@Getter
	@Setter
	@Builder
	public static class BookingStatusResponse {
		private Long bookingId;
		private String status;
	}

	@Getter
	@Setter
	@Builder
	public static class Passenger {
		@NotBlank
		private String name;
		@Min(1)
		private Integer age;
		@NotBlank
		private String gender;
		private String idProof;
		private String idProofType;
		private String idProofNumber;
		private String passengerType;
		private String contactNumber;
		private String email;
	}

	@Getter
	@Setter
	@Builder
	public static class BookingSummaryResponse {
		private Long bookingId;
		private String trainName;
		private String trainNumber;
		private String source;
		private String destination;
		private String status;
		private BigDecimal totalAmount;
		private java.time.OffsetDateTime createdAt;
	}

	@Getter
	@Setter
	public static class WaitlistRequest {
		@NotNull
		private Long eventId;
		private Long userId;
		@NotBlank
		private String classType;
		@NotNull
		private Integer numberOfSeats;
		@NotNull
		private LocalDate journeyDate;
	}
}
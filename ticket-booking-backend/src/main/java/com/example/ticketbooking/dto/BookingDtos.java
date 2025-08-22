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
		@Size(min = 2, max = 100)
		private String customerName;
		@Email
		@NotBlank
		private String customerEmail;
		@NotBlank
		@Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
		private String customerPhone;
		@NotBlank
		@Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "journeyDate must be YYYY-MM-DD")
		private String journeyDate; // YYYY-MM-DD
		@Size(min = 1, message = "At least one passenger is required")
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
		@Size(min = 2, max = 100)
		private String name;
		@Min(1)
		@Max(120)
		private Integer age;
		@NotBlank
		@Pattern(regexp = "(?i)MALE|FEMALE|OTHER", message = "gender must be MALE, FEMALE or OTHER")
		private String gender;
		@NotBlank
		private String idProof;
		@NotBlank
		private String idProofType;
		@NotBlank
		@Size(min = 4, max = 50)
		private String idProofNumber;
		@NotBlank
		private String passengerType;
		@NotBlank
		@Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
		private String contactNumber;
		@Email
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
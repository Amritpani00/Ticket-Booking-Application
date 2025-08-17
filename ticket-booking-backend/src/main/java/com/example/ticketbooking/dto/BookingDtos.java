package com.example.ticketbooking.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class BookingDtos {

    @Getter
    @Setter
    public static class CreateBookingRequest {
        @NotNull
        private Long eventId;
        @NotEmpty
        private List<Long> seatIds;
        @NotBlank
        private String customerName;
        @Email
        @NotBlank
        private String customerEmail;
        @NotBlank
        private String customerPhone;
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
}
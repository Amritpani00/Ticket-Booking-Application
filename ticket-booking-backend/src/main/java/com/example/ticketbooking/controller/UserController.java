package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingDtos;
import com.example.ticketbooking.model.Booking;
import com.example.ticketbooking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final BookingRepository bookingRepository;

    @GetMapping("/bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingDtos.BookingSummaryResponse>> myBookings(@AuthenticationPrincipal User principal) {
        String email = principal.getUsername();
        List<Booking> bookings = bookingRepository.findSummariesByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email);
        List<BookingDtos.BookingSummaryResponse> resp = bookings.stream().map(b -> BookingDtos.BookingSummaryResponse.builder()
                .bookingId(b.getId())
                .trainName(b.getEvent().getName())
                .trainNumber(b.getEvent().getTrainNumber())
                .source(b.getEvent().getSource())
                .destination(b.getEvent().getDestination())
                .status(b.getStatus().name())
                .totalAmount(b.getTotalAmount())
                .createdAt(b.getCreatedAt())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(resp);
    }
}


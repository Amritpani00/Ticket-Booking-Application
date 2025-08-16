package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByPaymentOrderId(String paymentOrderId);
}
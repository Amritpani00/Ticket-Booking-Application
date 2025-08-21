package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
	Optional<Booking> findByPaymentOrderId(String paymentOrderId);
	List<Booking> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);
}
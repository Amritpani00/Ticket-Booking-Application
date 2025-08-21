package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
	Optional<Booking> findByPaymentOrderId(String paymentOrderId);
	List<Booking> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);

	@Query("select distinct b from Booking b join fetch b.event left join fetch b.seats where b.id = :id")
	Optional<Booking> findByIdWithEventAndSeats(@Param("id") Long id);

	@Query("select b from Booking b join fetch b.event where lower(b.customerEmail) = lower(:email) order by b.createdAt desc")
	List<Booking> findSummariesByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(@Param("email") String email);
}
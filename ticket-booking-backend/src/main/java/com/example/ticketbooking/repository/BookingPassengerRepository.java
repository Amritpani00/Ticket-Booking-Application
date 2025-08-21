package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.BookingPassenger;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingPassengerRepository extends JpaRepository<BookingPassenger, Long> {
}


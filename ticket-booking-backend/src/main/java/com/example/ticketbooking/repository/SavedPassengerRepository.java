package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.SavedPassenger;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedPassengerRepository extends JpaRepository<SavedPassenger, Long> {
	List<SavedPassenger> findByUser_IdOrderByIdDesc(Long userId);
}
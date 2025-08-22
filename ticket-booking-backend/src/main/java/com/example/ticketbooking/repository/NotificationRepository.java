package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
	List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);
	List<Notification> findByUser_IdAndReadAtIsNullOrderByCreatedAtDesc(Long userId);
}
package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Coach;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoachRepository extends JpaRepository<Coach, Long> {

    List<Coach> findByEvent_IdOrderByPositionAscIdAsc(Long eventId);
}


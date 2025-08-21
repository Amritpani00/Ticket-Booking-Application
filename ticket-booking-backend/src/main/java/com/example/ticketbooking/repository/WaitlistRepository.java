package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {

    @Query("SELECT w FROM Waitlist w WHERE w.event.id = :eventId AND w.classType = :classType AND w.journeyDate = :journeyDate ORDER BY w.waitlistNumber")
    List<Waitlist> findByEvent_IdAndClassTypeAndJourneyDate(@Param("eventId") Long eventId, @Param("classType") String classType, @Param("journeyDate") LocalDate journeyDate);

    @Query("SELECT w FROM Waitlist w WHERE w.user.id = :userId ORDER BY w.waitlistDate DESC")
    List<Waitlist> findByUserId(@Param("userId") Long userId);

    @Query("SELECT w FROM Waitlist w WHERE w.status = 'WAITING' ORDER BY w.waitlistDate")
    List<Waitlist> findActiveWaitlist();

    @Query("SELECT COUNT(w) FROM Waitlist w WHERE w.event.id = :eventId AND w.classType = :classType AND w.journeyDate = :journeyDate AND w.status = 'WAITING'")
    Long countActiveWaitlist(@Param("eventId") Long eventId, @Param("classType") String classType, @Param("journeyDate") LocalDate journeyDate);

    @Query("SELECT MAX(w.waitlistNumber) FROM Waitlist w WHERE w.event.id = :eventId AND w.classType = :classType AND w.journeyDate = :journeyDate")
    Integer findMaxWaitlistNumber(@Param("eventId") Long eventId, @Param("classType") String classType, @Param("journeyDate") LocalDate journeyDate);
}
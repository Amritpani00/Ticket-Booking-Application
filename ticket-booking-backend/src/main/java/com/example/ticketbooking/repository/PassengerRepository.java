package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PassengerRepository extends JpaRepository<Passenger, Long> {

    List<Passenger> findByBooking_Id(Long bookingId);

    @Query("SELECT p FROM Passenger p WHERE p.booking.event.id = :eventId")
    List<Passenger> findByEventId(@Param("eventId") Long eventId);

    @Query("SELECT p FROM Passenger p WHERE p.idProofNumber = :idProofNumber")
    List<Passenger> findByIdProofNumber(@Param("idProofNumber") String idProofNumber);

    @Query("SELECT p FROM Passenger p WHERE p.booking.event.id = :eventId AND p.coachCode = :coachCode")
    List<Passenger> findByEventIdAndCoachCode(@Param("eventId") Long eventId, @Param("coachCode") String coachCode);
}
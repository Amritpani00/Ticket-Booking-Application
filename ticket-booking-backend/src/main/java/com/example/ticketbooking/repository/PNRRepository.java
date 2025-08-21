package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.PNR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PNRRepository extends JpaRepository<PNR, Long> {

    Optional<PNR> findByPnrNumber(String pnrNumber);

    Optional<PNR> findByBooking_Id(Long bookingId);

    @Query("SELECT p FROM PNR p WHERE p.trainNumber = :trainNumber AND p.journeyDate = :journeyDate")
    List<PNR> findByTrainNumberAndJourneyDate(@Param("trainNumber") String trainNumber, @Param("journeyDate") LocalDate journeyDate);

    @Query("SELECT p FROM PNR p WHERE p.status = :status")
    List<PNR> findByStatus(@Param("status") PNR.PNRStatus status);

    @Query("SELECT p FROM PNR p WHERE p.pnrGeneratedDate >= :fromDate AND p.pnrGeneratedDate <= :toDate")
    List<PNR> findByPnrGeneratedDateBetween(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);
}
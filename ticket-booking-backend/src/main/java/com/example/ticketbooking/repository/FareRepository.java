package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Fare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FareRepository extends JpaRepository<Fare, Long> {

    @Query("SELECT f FROM Fare f WHERE f.event.id = :eventId AND f.classType = :classType AND f.isActive = true AND f.effectiveFrom <= :date AND (f.effectiveTo IS NULL OR f.effectiveTo >= :date)")
    Optional<Fare> findActiveFareByEventAndClassType(@Param("eventId") Long eventId, @Param("classType") String classType, @Param("date") LocalDate date);

    @Query("SELECT f FROM Fare f WHERE f.event.id = :eventId AND f.isActive = true AND f.effectiveFrom <= :date AND (f.effectiveTo IS NULL OR f.effectiveTo >= :date)")
    List<Fare> findActiveFaresByEvent(@Param("eventId") Long eventId, @Param("date") LocalDate date);

    @Query("SELECT f FROM Fare f WHERE f.event.id = :eventId AND f.classType = :classType")
    List<Fare> findByEventIdAndClassType(@Param("eventId") Long eventId, @Param("classType") String classType);

    @Query("SELECT f FROM Fare f WHERE f.fareCategory = :category AND f.isActive = true")
    List<Fare> findByCategory(@Param("category") String category);

    @Query("SELECT f FROM Fare f WHERE f.baseFare BETWEEN :minFare AND :maxFare AND f.isActive = true")
    List<Fare> findByFareRange(@Param("minFare") BigDecimal minFare, @Param("maxFare") BigDecimal maxFare);

    @Query("SELECT f FROM Fare f WHERE f.event.id = :eventId AND f.isActive = true ORDER BY f.classType")
    List<Fare> findAllActiveFaresByEvent(@Param("eventId") Long eventId);
}
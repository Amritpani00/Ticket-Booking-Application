package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fares")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Fare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String classType; // 1A, 2A, 3A, SL, 2S, etc.

    @Column(nullable = false)
    private BigDecimal baseFare; // Base fare for the journey

    private BigDecimal reservationCharge; // Reservation charge

    private BigDecimal superfastCharge; // Superfast surcharge

    private BigDecimal tatkalCharge; // Tatkal booking charge

    private BigDecimal dynamicPricing; // Dynamic pricing adjustment

    @Column(nullable = false)
    private LocalDate effectiveFrom; // Date from which this fare is effective

    private LocalDate effectiveTo; // Date until which this fare is effective

    private Boolean isActive; // Whether this fare is currently active

    private String fareCategory; // Regular, Premium, Dynamic, etc.

    private BigDecimal distanceBasedFare; // Fare per km

    private Integer minimumDistance; // Minimum distance for this fare

    private String remarks; // Any special remarks about this fare

    private BigDecimal weekendSurcharge; // Weekend fare surcharge

    private BigDecimal holidaySurcharge; // Holiday fare surcharge

    private BigDecimal peakSeasonSurcharge; // Peak season surcharge
}
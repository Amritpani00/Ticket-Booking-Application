package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fare_enquiry")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareEnquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String sourceStation;

    @Column(nullable = false)
    private String destinationStation;

    @Column(nullable = false)
    private LocalDate journeyDate;

    @Column(nullable = false)
    private String classType;

    @Column(nullable = false)
    private BigDecimal baseFare;

    @Column(nullable = false)
    private BigDecimal reservationCharge;

    @Column(nullable = false)
    private BigDecimal superfastCharge;

    @Column(nullable = false)
    private BigDecimal tatkalCharge;

    @Column(nullable = false)
    private BigDecimal gst;

    @Column(nullable = false)
    private BigDecimal totalFare;

    private BigDecimal dynamicPricing; // Surge pricing

    private BigDecimal weekendSurcharge;

    private BigDecimal holidaySurcharge;

    private BigDecimal peakSeasonSurcharge;

    private BigDecimal distanceBasedFare;

    private Integer distanceInKm;

    private String fareCategory; // Regular, Premium, Dynamic

    private Boolean isActive;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private String remarks;

    // Calculate total fare
    public BigDecimal calculateTotalFare() {
        BigDecimal total = baseFare
            .add(reservationCharge)
            .add(superfastCharge)
            .add(tatkalCharge)
            .add(gst);
        
        if (dynamicPricing != null) total = total.add(dynamicPricing);
        if (weekendSurcharge != null) total = total.add(weekendSurcharge);
        if (holidaySurcharge != null) total = total.add(holidaySurcharge);
        if (peakSeasonSurcharge != null) total = total.add(peakSeasonSurcharge);
        
        return total;
    }
}
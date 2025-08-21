package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pnr")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PNR {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String pnrNumber; // 10-digit PNR number

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private LocalDateTime pnrGeneratedDate;

    @Column(nullable = false)
    private LocalDateTime journeyDate;

    @Column(nullable = false)
    private String sourceStation;

    @Column(nullable = false)
    private String destinationStation;

    @Column(nullable = false)
    private String trainNumber;

    @Column(nullable = false)
    private String trainName;

    @Column(nullable = false)
    private String classType;

    @Column(nullable = false)
    private Integer numberOfPassengers;

    @Column(nullable = false)
    private BigDecimal totalFare;

    @Column(nullable = false)
    private String seatNumbers; // Comma-separated seat numbers

    @Column(nullable = false)
    private String coachCodes; // Comma-separated coach codes

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private LocalDateTime arrivalTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PNRStatus status;

    private String chartStatus; // Prepared, Not Prepared

    private String platformNumber;

    private String remarks;

    public enum PNRStatus {
        CONFIRMED, WAITING, RAC, CANCELLED, EXPIRED
    }
}
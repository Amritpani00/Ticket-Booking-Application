package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.Set;

@Entity
@Table(name = "events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Train number for identification
    private String trainNumber;

    // Origin and destination stations
    private String source;
    private String destination;

    @Column(nullable = false)
    private String venue;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private BigDecimal seatPrice;

    private String description;

    // Class type for pricing context (e.g., "Sleeper", "3A", "2S")
    private String classType;
    
    // Enhanced train information
    private String trainType; // Express, Superfast, Passenger, etc.
    private String platformNumber;
    private Integer totalCoaches;
    private String runningDays; // Comma-separated days like "MON,TUE,WED,THU,FRI,SAT,SUN"
    private Boolean isRunningToday;
    private String intermediateStations; // Comma-separated station names
    private Integer journeyDurationMinutes;
    private String trainCategory; // Premium, Regular, etc.
    private Boolean hasPantry;
    private Boolean hasAC;
    private String trainOperator; // IRCTC, Private, etc.
    private String routeType; // Main line, Branch line, etc.
    private Integer averageSpeed; // in km/h
    private String trainStatus; // On Time, Delayed, Cancelled, etc.
    private Integer delayMinutes;
}
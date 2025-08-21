package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.Set;

@Entity
@Table(name = "train_schedules")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(nullable = false)
    private Integer sequenceNumber; // Order of stations in the route

    private LocalTime arrivalTime;

    private LocalTime departureTime;

    private Integer haltMinutes; // Minutes train stops at this station

    private Integer distanceFromSource; // Distance in km from source station

    private String platformNumber;

    private String dayNumber; // Day 1, 2, 3 for multi-day journeys

    private Boolean isSource;

    private Boolean isDestination;

    private Boolean isHalt; // Whether train stops at this station

    private String remarks; // Any special remarks about this stop

    private Integer runningDay; // 1-7 representing days of week

    private String stationCode; // For quick reference

    private String stationName; // For quick reference
}
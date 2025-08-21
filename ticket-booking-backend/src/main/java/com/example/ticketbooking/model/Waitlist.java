package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "waitlist")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Waitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false)
    private String classType; // 1A, 2A, 3A, SL, etc.

    @Column(nullable = false)
    private Integer numberOfSeats;

    @Column(nullable = false)
    private Integer waitlistNumber; // Position in waiting list

    @Column(nullable = false)
    private LocalDateTime waitlistDate;

    @Column(nullable = false)
    private LocalDateTime journeyDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WaitlistStatus status;

    private LocalDateTime confirmedDate; // When seat becomes available

    private String confirmedSeatNumbers; // Comma-separated seat numbers

    private String confirmedCoachCode;

    private String remarks;

    public enum WaitlistStatus {
        WAITING, CONFIRMED, CANCELLED, EXPIRED
    }
}
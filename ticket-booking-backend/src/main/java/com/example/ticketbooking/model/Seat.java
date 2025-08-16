package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats", indexes = {
        @Index(columnList = "event_id"),
        @Index(columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    public enum Status { AVAILABLE, RESERVED, BOOKED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(nullable = false)
    private String rowLabel;

    @Column(nullable = false)
    private Integer seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
}
package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coaches", indexes = {
        @Index(columnList = "event_id"),
        @Index(columnList = "code")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id")
    private Event event;

    // Coach code like "A1", "B2", "S1", "GEN1"
    @Column(nullable = false)
    private String code;

    // Class type like "1A", "2A", "3A", "SL", "2S", "GEN"
    @Column(nullable = false)
    private String classType;

    // Optional ordering of coach within rake
    private Integer position;
}


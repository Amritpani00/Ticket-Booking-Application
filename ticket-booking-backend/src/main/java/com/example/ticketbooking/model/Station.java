package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // Station code like NDLS, BCT, etc.

    @Column(nullable = false)
    private String name; // Full station name

    @Column(nullable = false)
    private String city; // City name

    private String state; // State name

    private String zone; // Railway zone like NR, WR, CR, etc.

    private String category; // A1, A, B, C, D, E, F

    private Boolean hasACWaitingRoom;

    private Boolean hasNonACWaitingRoom;

    private Boolean hasRetiringRoom;

    private Boolean hasFoodCourt;

    private Boolean hasParking;

    private Boolean hasEscalator;

    private Boolean hasElevator;

    private String platformCount;

    private String stationType; // Junction, Terminal, Halt, etc.

    private Double latitude;

    private Double longitude;

    private String address;

    private String contactNumber;

    private String facilities; // Comma-separated list of facilities
}
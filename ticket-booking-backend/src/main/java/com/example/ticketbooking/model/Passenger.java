package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "passengers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(nullable = false)
    private String idProofType; // Aadhar, PAN, Driving License, etc.

    @Column(nullable = false)
    private String idProofNumber;

    @Column(nullable = false)
    private String seatNumber; // Assigned seat number

    @Column(nullable = false)
    private String coachCode; // Coach code (A1, S1, etc.)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private String passengerType; // Adult, Child, Senior Citizen, etc.

    private String contactNumber;

    private String email;

    private LocalDate dateOfBirth;

    private String nationality;

    private String address;

    private String emergencyContact;

    private String specialRequirements; // Wheelchair, etc.

    public enum Gender {
        MALE, FEMALE, OTHER
    }
}
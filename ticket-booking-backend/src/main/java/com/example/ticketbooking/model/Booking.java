package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "bookings", indexes = {
    @Index(columnList = "paymentOrderId"),
    @Index(columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    public enum Status { PENDING_PAYMENT, CONFIRMED, CANCELED, EXPIRED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id")
    @JsonIgnore
    private Event event;

    @ManyToMany
    @JoinTable(
        name = "booking_seats",
        joinColumns = @JoinColumn(name = "booking_id"),
        inverseJoinColumns = @JoinColumn(name = "seat_id")
    )
    @Builder.Default
    @JsonIgnore
    private Set<Seat> seats = new HashSet<>();

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private String customerPhone;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column
    private String paymentOrderId;

    @Column
    private String razorpayPaymentId;

    @Column
    private String razorpaySignature;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column
    private OffsetDateTime reservationExpiresAt;
}
package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "notifications", indexes = { @Index(columnList = "user_id,readAt") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id")
	private AppUser user;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false, length = 1000)
	private String body;

	@Column(nullable = false)
	private OffsetDateTime createdAt;

	@Column
	private OffsetDateTime readAt;
}
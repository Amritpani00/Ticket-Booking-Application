package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "saved_searches", indexes = { @Index(columnList = "user_id") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedSearch {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id")
	private AppUser user;

	@Column(nullable = false)
	private String name;

	@Column
	private String source;

	@Column
	private String destination;

	@Column
	private String journeyDate; // YYYY-MM-DD

	@Column
	private String trainType;

	@Column
	private String trainCategory;

	@Column
	private Boolean hasAC;

	@Column
	private String trainOperator;

	@Column
	private Integer minSpeed;

	@Column
	private Double maxFare;

	@Column
	private String classType;

	@Column
	private String sortBy;

	@Column
	private String sortOrder;

	@Column(nullable = false)
	private OffsetDateTime createdAt;
}
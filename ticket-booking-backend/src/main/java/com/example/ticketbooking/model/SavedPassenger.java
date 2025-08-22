package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "saved_passengers", indexes = { @Index(columnList = "user_id") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedPassenger {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id")
	private AppUser user;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private Integer age;

	@Column(nullable = false)
	private String gender;

	@Column
	private String idProofType;

	@Column
	private String idProofNumber;

	@Column(nullable = false)
	private String passengerType;

	@Column
	private String contactNumber;

	@Column
	private String email;
}
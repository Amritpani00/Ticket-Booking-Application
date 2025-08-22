package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.AppUser;
import com.example.ticketbooking.model.SavedPassenger;
import com.example.ticketbooking.repository.SavedPassengerRepository;
import com.example.ticketbooking.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/saved-passengers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SavedPassengerController {

	private final SavedPassengerRepository savedPassengerRepository;
	private final UserRepository userRepository;

	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public List<SavedPassenger> list(@AuthenticationPrincipal User principal) {
		AppUser u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
		return savedPassengerRepository.findByUser_IdOrderByIdDesc(u.getId());
	}

	@PostMapping
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<SavedPassenger> create(@AuthenticationPrincipal User principal, @Valid @RequestBody SaveReq req) {
		AppUser u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
		SavedPassenger sp = SavedPassenger.builder()
				.user(u)
				.name(req.getName())
				.age(req.getAge())
				.gender(req.getGender())
				.idProofType(req.getIdProofType())
				.idProofNumber(req.getIdProofNumber())
				.passengerType(req.getPassengerType())
				.contactNumber(req.getContactNumber())
				.email(req.getEmail())
				.build();
		return ResponseEntity.ok(savedPassengerRepository.save(sp));
	}

	@PutMapping("/{id}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<SavedPassenger> update(@AuthenticationPrincipal User principal, @PathVariable Long id, @Valid @RequestBody SaveReq req) {
		AppUser u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
		return savedPassengerRepository.findById(id)
				.filter(p -> p.getUser().getId().equals(u.getId()))
				.map(p -> {
					p.setName(req.getName());
					p.setAge(req.getAge());
					p.setGender(req.getGender());
					p.setIdProofType(req.getIdProofType());
					p.setIdProofNumber(req.getIdProofNumber());
					p.setPassengerType(req.getPassengerType());
					p.setContactNumber(req.getContactNumber());
					p.setEmail(req.getEmail());
					return ResponseEntity.ok(savedPassengerRepository.save(p));
				})
				.orElse(ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> delete(@AuthenticationPrincipal User principal, @PathVariable Long id) {
		AppUser u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
		return savedPassengerRepository.findById(id)
				.filter(p -> p.getUser().getId().equals(u.getId()))
				.map(p -> { savedPassengerRepository.delete(p); return ResponseEntity.noContent().build(); })
				.orElse(ResponseEntity.notFound().build());
	}

	@Getter
	@Setter
	public static class SaveReq {
		@NotBlank private String name;
		@NotNull private Integer age;
		@NotBlank private String gender;
		private String idProofType;
		private String idProofNumber;
		@NotBlank private String passengerType;
		private String contactNumber;
		private String email;
	}
}
package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.AppUser;
import com.example.ticketbooking.model.SavedSearch;
import com.example.ticketbooking.repository.SavedSearchRepository;
import com.example.ticketbooking.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/user/saved-searches")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SavedSearchController {

	private final SavedSearchRepository repository;
	private final UserRepository userRepository;

	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public List<SavedSearch> list(@AuthenticationPrincipal User principal) {
		AppUser u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
		return repository.findByUser_IdOrderByCreatedAtDesc(u.getId());
	}

	@PostMapping
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<SavedSearch> create(@AuthenticationPrincipal User principal, @Valid @RequestBody SaveReq req) {
		AppUser u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
		SavedSearch s = SavedSearch.builder()
				.user(u)
				.name(req.getName())
				.source(req.getSource())
				.destination(req.getDestination())
				.journeyDate(req.getJourneyDate())
				.trainType(req.getTrainType())
				.trainCategory(req.getTrainCategory())
				.hasAC(req.getHasAC())
				.trainOperator(req.getTrainOperator())
				.minSpeed(req.getMinSpeed())
				.maxFare(req.getMaxFare())
				.classType(req.getClassType())
				.sortBy(req.getSortBy())
				.sortOrder(req.getSortOrder())
				.createdAt(OffsetDateTime.now())
				.build();
		return ResponseEntity.ok(repository.save(s));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> delete(@AuthenticationPrincipal User principal, @PathVariable Long id) {
		AppUser u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
		return repository.findById(id)
				.filter(p -> p.getUser().getId().equals(u.getId()))
				.map(p -> { repository.delete(p); return ResponseEntity.noContent().build(); })
				.orElse(ResponseEntity.notFound().build());
	}

	@Getter
	@Setter
	public static class SaveReq {
		@NotBlank private String name;
		private String source;
		private String destination;
		private String journeyDate;
		private String trainType;
		private String trainCategory;
		private Boolean hasAC;
		private String trainOperator;
		private Integer minSpeed;
		private Double maxFare;
		private String classType;
		private String sortBy;
		private String sortOrder;
	}
}
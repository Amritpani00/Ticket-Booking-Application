package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.AppUser;
import com.example.ticketbooking.model.Notification;
import com.example.ticketbooking.repository.NotificationRepository;
import com.example.ticketbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

	private final NotificationRepository repository;
	private final UserRepository userRepository;

	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public List<Notification> list(@AuthenticationPrincipal User principal) {
		AppUser u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
		return repository.findByUser_IdOrderByCreatedAtDesc(u.getId());
	}

	@GetMapping("/unread-count")
	@PreAuthorize("isAuthenticated()")
	public Map<String, Object> unreadCount(@AuthenticationPrincipal User principal) {
		AppUser u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
		int count = repository.findByUser_IdAndReadAtIsNullOrderByCreatedAtDesc(u.getId()).size();
		return Map.of("unread", count);
	}

	@PostMapping("/{id}/read")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> markRead(@AuthenticationPrincipal User principal, @PathVariable Long id) {
		AppUser u = userRepository.findByEmail(principal.getUsername()).orElseThrow();
		return repository.findById(id)
				.filter(n -> n.getUser().getId().equals(u.getId()))
				.map(n -> { n.setReadAt(OffsetDateTime.now()); repository.save(n); return ResponseEntity.ok(Map.of("ok", true)); })
				.orElse(ResponseEntity.notFound().build());
	}
}
package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.Coach;
import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.repository.CoachRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rake")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminCoachController {

	private final EventRepository eventRepository;
	private final CoachRepository coachRepository;
	private final SeatRepository seatRepository;

	@PostMapping("/reset/{eventId}")
	@PreAuthorize("hasRole('ADMIN')")
	@Transactional
	public ResponseEntity<?> resetRake(@PathVariable Long eventId, @RequestParam(defaultValue = "2") int coaches, @RequestParam(defaultValue = "40") int seatsPerCoach, @RequestParam(defaultValue = "SL") String classType) {
		Event event = eventRepository.findById(eventId).orElse(null);
		if (event == null) return ResponseEntity.notFound().build();

		List<Coach> existing = coachRepository.findByEvent_IdOrderByPositionAscIdAsc(eventId);
		for (Coach c : existing) {
			for (Seat s : seatRepository.findByCoach_Id(c.getId())) {
				seatRepository.delete(s);
			}
			coachRepository.delete(c);
		}

		for (int i = 1; i <= coaches; i++) {
			Coach c = Coach.builder().event(event).code(classType + i).classType(classType).position(i).build();
			c = coachRepository.save(c);
			char row = 'A';
			for (int s = 1; s <= seatsPerCoach; s++) {
				if (s % 20 == 1 && s > 1) row++;
				Seat seat = Seat.builder().event(event).coach(c).rowLabel(String.valueOf(row)).seatNumber((s - 1) % 20 + 1).status(Seat.Status.AVAILABLE).build();
				seatRepository.save(seat);
			}
		}
		return ResponseEntity.ok().build();
	}
}
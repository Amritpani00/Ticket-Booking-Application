package com.example.ticketbooking.controller;

import com.example.ticketbooking.service.SeatUpdateBroadcaster;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class RealtimeController {

	private final SeatUpdateBroadcaster broadcaster;

	public RealtimeController(SeatUpdateBroadcaster broadcaster) {
		this.broadcaster = broadcaster;
	}

	@GetMapping("/{eventId}/seats/stream")
	public SseEmitter seatsStream(@PathVariable Long eventId) {
		return broadcaster.subscribe(eventId);
	}
}
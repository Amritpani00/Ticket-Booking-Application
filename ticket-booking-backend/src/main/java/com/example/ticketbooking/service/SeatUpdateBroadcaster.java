package com.example.ticketbooking.service;

import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.repository.SeatRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class SeatUpdateBroadcaster {

	private final SeatRepository seatRepository;

	public SeatUpdateBroadcaster(SeatRepository seatRepository) {
		this.seatRepository = seatRepository;
	}

	private final Map<Long, CopyOnWriteArrayList<SseEmitter>> eventIdToEmitters = new ConcurrentHashMap<>();

	public SseEmitter subscribe(Long eventId) {
		SseEmitter emitter = new SseEmitter(0L);
		eventIdToEmitters.computeIfAbsent(eventId, k -> new CopyOnWriteArrayList<>()).add(emitter);
		emitter.onCompletion(() -> remove(eventId, emitter));
		emitter.onTimeout(() -> remove(eventId, emitter));

		// Send initial snapshot
		List<Map<String, Object>> snapshot = seatRepository.findByEvent_Id(eventId).stream()
				.map(s -> {
					java.util.Map<String, Object> m = new java.util.HashMap<>();
					m.put("id", s.getId());
					m.put("rowLabel", s.getRowLabel());
					m.put("seatNumber", s.getSeatNumber());
					m.put("status", s.getStatus().name());
					return m;
				})
				.collect(Collectors.toList());
		try {
			emitter.send(SseEmitter.event()
					.data(Map.of("type", "init", "data", snapshot), MediaType.APPLICATION_JSON));
		} catch (IOException ignored) {
			remove(eventId, emitter);
		}
		return emitter;
	}

	public void broadcastSeatStatus(Long eventId, List<Seat> seats) {
		List<Map<String, Object>> updates = seats.stream()
				.map(s -> {
					java.util.Map<String, Object> m = new java.util.HashMap<>();
					m.put("id", s.getId());
					m.put("rowLabel", s.getRowLabel());
					m.put("seatNumber", s.getSeatNumber());
					m.put("status", s.getStatus().name());
					return m;
				})
				.collect(Collectors.toList());
		CopyOnWriteArrayList<SseEmitter> emitters = eventIdToEmitters.get(eventId);
		if (emitters == null || emitters.isEmpty()) return;
		for (SseEmitter emitter : emitters) {
			try {
				emitter.send(SseEmitter.event()
						.data(Map.of("type", "update", "data", updates), MediaType.APPLICATION_JSON));
			} catch (IOException e) {
				remove(eventId, emitter);
			}
		}
	}

	private void remove(Long eventId, SseEmitter emitter) {
		CopyOnWriteArrayList<SseEmitter> list = eventIdToEmitters.get(eventId);
		if (list != null) list.remove(emitter);
	}
}
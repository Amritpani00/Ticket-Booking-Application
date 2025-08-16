package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    @GetMapping
    public List<Event> list(@RequestParam(value = "q", required = false) String q) {
        if (q == null || q.isBlank()) {
            return eventRepository.findAll();
        }
        return eventRepository.searchByText(q);
    }

    @GetMapping("/{eventId}/seats")
    public ResponseEntity<List<Seat>> seats(@PathVariable Long eventId) {
        return eventRepository.findById(eventId)
                .map(e -> ResponseEntity.ok(seatRepository.findByEvent_Id(eventId)))
                .orElse(ResponseEntity.notFound().build());
    }
}
package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.EventDtos;
import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    @GetMapping
    public List<EventDtos.EventResponse> list(@RequestParam(value = "q", required = false) String q,
                                              @RequestParam(value = "source", required = false) String source,
                                              @RequestParam(value = "destination", required = false) String destination) {
        List<Event> events;
        if (source != null && !source.isBlank() && destination != null && !destination.isBlank()) {
            events = eventRepository.searchByRoute(source, destination);
        } else {
            events = (q == null || q.isBlank()) ? eventRepository.findAll() : eventRepository.searchByText(q);
        }
        return events.stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{eventId}/seats")
    public ResponseEntity<List<Seat>> seats(@PathVariable Long eventId) {
        return eventRepository.findById(eventId)
                .map(e -> ResponseEntity.ok(seatRepository.findByEvent_Id(eventId)))
                .orElse(ResponseEntity.notFound().build());
    }

    private EventDtos.EventResponse toDto(Event e) {
        return EventDtos.EventResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .trainNumber(e.getTrainNumber())
                .source(e.getSource())
                .destination(e.getDestination())
                .venue(e.getVenue())
                .description(e.getDescription())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .seatPrice(e.getSeatPrice())
                .classType(e.getClassType())
                .build();
    }
}
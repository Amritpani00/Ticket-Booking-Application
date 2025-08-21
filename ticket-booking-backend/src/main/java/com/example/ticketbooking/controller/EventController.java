package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.EventDtos;
import com.example.ticketbooking.dto.CoachDtos;
import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.model.Coach;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import com.example.ticketbooking.repository.CoachRepository;
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
    private final CoachRepository coachRepository;

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

    @GetMapping("/{eventId}")
    public ResponseEntity<EventDtos.EventResponse> get(@PathVariable Long eventId) {
        return eventRepository.findById(eventId)
                .map(e -> ResponseEntity.ok(toDto(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{eventId}/seats")
    public ResponseEntity<List<Seat>> seats(@PathVariable Long eventId) {
        return eventRepository.findById(eventId)
                .map(e -> ResponseEntity.ok(seatRepository.findByEvent_Id(eventId)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{eventId}/coaches")
    public ResponseEntity<List<CoachDtos.CoachResponse>> listCoaches(@PathVariable Long eventId) {
        return eventRepository.findById(eventId)
                .map(e -> {
                    List<Coach> coaches = coachRepository.findByEvent_IdOrderByPositionAscIdAsc(eventId);
                    List<CoachDtos.CoachResponse> resp = coaches.stream().map(c -> {
                        long available = seatRepository.countByCoach_IdAndStatus(c.getId(), Seat.Status.AVAILABLE);
                        long reserved = seatRepository.countByCoach_IdAndStatus(c.getId(), Seat.Status.RESERVED);
                        long booked = seatRepository.countByCoach_IdAndStatus(c.getId(), Seat.Status.BOOKED);
                        long total = available + reserved + booked;
                        return CoachDtos.CoachResponse.builder()
                                .id(c.getId())
                                .code(c.getCode())
                                .classType(c.getClassType())
                                .available(available)
                                .reserved(reserved)
                                .booked(booked)
                                .total(total)
                                .build();
                    }).collect(Collectors.toList());
                    return ResponseEntity.ok(resp);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/coaches/{coachId}/seats")
    public ResponseEntity<List<Seat>> seatsByCoach(@PathVariable Long coachId) {
        return coachRepository.findById(coachId)
                .map(c -> ResponseEntity.ok(seatRepository.findByCoach_Id(coachId)))
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
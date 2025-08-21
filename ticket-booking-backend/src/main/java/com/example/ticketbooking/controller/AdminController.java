package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.repository.EventRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final EventRepository eventRepository;

    @GetMapping("/trains")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Event> listTrains() {
        return eventRepository.findAll();
    }

    @PostMapping("/trains")
    @PreAuthorize("hasRole('ADMIN')")
    public Event addTrain(@Valid @RequestBody Event event) {
        event.setId(null);
        return eventRepository.save(event);
    }

    @PutMapping("/trains/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Event> updateTrain(@PathVariable Long id, @Valid @RequestBody Event payload) {
        Optional<Event> existing = eventRepository.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        Event e = existing.get();
        e.setName(payload.getName());
        e.setTrainNumber(payload.getTrainNumber());
        e.setSource(payload.getSource());
        e.setDestination(payload.getDestination());
        e.setVenue(payload.getVenue());
        e.setDescription(payload.getDescription());
        e.setStartTime(payload.getStartTime());
        e.setEndTime(payload.getEndTime());
        e.setSeatPrice(payload.getSeatPrice());
        e.setClassType(payload.getClassType());
        return ResponseEntity.ok(eventRepository.save(e));
    }

    @DeleteMapping("/trains/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTrain(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) return ResponseEntity.notFound().build();
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


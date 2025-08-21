package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.EventDtos;
import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/train-search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrainSearchController {

    private final EventRepository eventRepository;
    private final StationRepository stationRepository;

    @GetMapping("/advanced")
    public List<EventDtos.EventResponse> advancedSearch(
            @RequestParam(value = "source", required = false) String source,
            @RequestParam(value = "destination", required = false) String destination,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "trainType", required = false) String trainType,
            @RequestParam(value = "trainCategory", required = false) String trainCategory,
            @RequestParam(value = "hasAC", required = false) Boolean hasAC,
            @RequestParam(value = "trainOperator", required = false) String trainOperator,
            @RequestParam(value = "minSpeed", required = false) Integer minSpeed,
            @RequestParam(value = "maxFare", required = false) Double maxFare,
            @RequestParam(value = "classType", required = false) String classType,
            @RequestParam(value = "sortBy", defaultValue = "startTime") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "asc") String sortOrder) {

        List<Event> events = eventRepository.findAll();

        // Apply filters
        if (source != null && !source.trim().isEmpty()) {
            events = events.stream()
                    .filter(e -> e.getSource() != null && e.getSource().toLowerCase().contains(source.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (destination != null && !destination.trim().isEmpty()) {
            events = events.stream()
                    .filter(e -> e.getDestination() != null && e.getDestination().toLowerCase().contains(destination.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (date != null) {
            events = events.stream()
                    .filter(e -> e.getStartTime() != null && e.getStartTime().toLocalDate().equals(date))
                    .collect(Collectors.toList());
        }

        if (trainType != null && !trainType.trim().isEmpty()) {
            events = events.stream()
                    .filter(e -> e.getTrainType() != null && e.getTrainType().equalsIgnoreCase(trainType))
                    .collect(Collectors.toList());
        }

        if (trainCategory != null && !trainCategory.trim().isEmpty()) {
            events = events.stream()
                    .filter(e -> e.getTrainCategory() != null && e.getTrainCategory().equalsIgnoreCase(trainCategory))
                    .collect(Collectors.toList());
        }

        if (hasAC != null) {
            events = events.stream()
                    .filter(e -> e.getHasAC() != null && e.getHasAC().equals(hasAC))
                    .collect(Collectors.toList());
        }

        if (trainOperator != null && !trainOperator.trim().isEmpty()) {
            events = events.stream()
                    .filter(e -> e.getTrainOperator() != null && e.getTrainOperator().equalsIgnoreCase(trainOperator))
                    .collect(Collectors.toList());
        }

        if (minSpeed != null) {
            events = events.stream()
                    .filter(e -> e.getAverageSpeed() != null && e.getAverageSpeed() >= minSpeed)
                    .collect(Collectors.toList());
        }

        if (maxFare != null) {
            events = events.stream()
                    .filter(e -> e.getSeatPrice() != null && e.getSeatPrice().doubleValue() <= maxFare)
                    .collect(Collectors.toList());
        }

        if (classType != null && !classType.trim().isEmpty()) {
            events = events.stream()
                    .filter(e -> e.getClassType() != null && e.getClassType().equalsIgnoreCase(classType))
                    .collect(Collectors.toList());
        }

        // Apply sorting
        if ("startTime".equals(sortBy)) {
            if ("desc".equals(sortOrder)) {
                events.sort((e1, e2) -> e2.getStartTime().compareTo(e1.getStartTime()));
            } else {
                events.sort((e1, e2) -> e1.getStartTime().compareTo(e2.getStartTime()));
            }
        } else if ("fare".equals(sortBy)) {
            if ("desc".equals(sortOrder)) {
                events.sort((e1, e2) -> e2.getSeatPrice().compareTo(e1.getSeatPrice()));
            } else {
                events.sort((e1, e2) -> e1.getSeatPrice().compareTo(e2.getSeatPrice()));
            }
        } else if ("duration".equals(sortBy)) {
            if ("desc".equals(sortOrder)) {
                events.sort((e1, e2) -> e2.getEndTime().compareTo(e1.getEndTime()));
            } else {
                events.sort((e1, e2) -> e1.getEndTime().compareTo(e2.getEndTime()));
            }
        }

        return events.stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/filters")
    public ResponseEntity<?> getAvailableFilters() {
        return ResponseEntity.ok(java.util.Map.of(
                "trainTypes", eventRepository.findAllTrainTypes(),
                "trainCategories", eventRepository.findAllTrainCategories(),
                "trainOperators", eventRepository.findAllTrainOperators(),
                "cities", stationRepository.findAllCities(),
                "states", stationRepository.findAllStates(),
                "zones", stationRepository.findAllZones()
        ));
    }

    @GetMapping("/popular-routes")
    public ResponseEntity<?> getPopularRoutes() {
        // Return some popular routes
        return ResponseEntity.ok(List.of(
                java.util.Map.of("source", "New Delhi", "destination", "Mumbai Central", "code", "NDLS-BCT"),
                java.util.Map.of("source", "Mumbai Central", "destination", "New Delhi", "code", "BCT-NDLS"),
                java.util.Map.of("source", "Kolkata", "destination", "New Delhi", "code", "HWH-NDLS"),
                java.util.Map.of("source", "Chennai Central", "destination", "Bangalore City", "code", "MAS-SBC"),
                java.util.Map.of("source", "Bangalore City", "destination", "Chennai Central", "code", "SBC-MAS")
        ));
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
package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.EventDtos;
import com.example.ticketbooking.dto.CoachDtos;
import com.example.ticketbooking.model.*;
import com.example.ticketbooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/train-search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrainSearchController {

    private final EventRepository eventRepository;
    private final StationRepository stationRepository;
    private final SeatRepository seatRepository;
    private final CoachRepository coachRepository;
    private final FareRepository fareRepository;
    private final WaitlistRepository waitlistRepository;

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

    @GetMapping("/by-train-number/{trainNumber}")
    public ResponseEntity<EventDtos.EventResponse> searchByTrainNumber(@PathVariable String trainNumber) {
        List<Event> trains = eventRepository.findByTrainNumber(trainNumber);
        if (trains.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toDto(trains.get(0)));
    }

    @GetMapping("/by-train-name/{trainName}")
    public ResponseEntity<List<EventDtos.EventResponse>> searchByTrainName(@PathVariable String trainName) {
        List<Event> trains = eventRepository.searchByText(trainName);
        return ResponseEntity.ok(trains.stream().map(this::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/seat-availability/{eventId}")
    public ResponseEntity<Map<String, Object>> getSeatAvailability(
            @PathVariable Long eventId,
            @RequestParam String classType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate journeyDate) {
        
        try {
            Event event = eventRepository.findById(eventId).orElse(null);
            if (event == null) {
                return ResponseEntity.notFound().build();
            }

            // Get coaches for the specified class type
            List<Coach> coaches = coachRepository.findByEvent_IdAndClassType(eventId, classType);
            
            int totalSeats = 0;
            int availableSeats = 0;
            int bookedSeats = 0;
            int waitlistCount = 0;

            for (Coach coach : coaches) {
                List<Seat> seats = seatRepository.findByCoach_Id(coach.getId());
                totalSeats += seats.size();
                
                for (Seat seat : seats) {
                    if (seat.getStatus() == Seat.Status.AVAILABLE) {
                        availableSeats++;
                    } else if (seat.getStatus() == Seat.Status.BOOKED) {
                        bookedSeats++;
                    }
                }
            }

            // Check waitlist
            List<Waitlist> waitlist = waitlistRepository.findByEvent_IdAndClassTypeAndJourneyDate(eventId, classType, journeyDate);
            waitlistCount = waitlist.size();

            Map<String, Object> response = new HashMap<>();
            response.put("eventId", eventId);
            response.put("classType", classType);
            response.put("journeyDate", journeyDate);
            response.put("totalSeats", totalSeats);
            response.put("availableSeats", availableSeats);
            response.put("bookedSeats", bookedSeats);
            response.put("waitlistCount", waitlistCount);
            response.put("hasWaitlist", waitlistCount > 0);
            response.put("status", availableSeats > 0 ? "AVAILABLE" : "WAITLIST");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/fare-enquiry")
    public ResponseEntity<Map<String, Object>> getFareEnquiry(
            @RequestParam Long eventId,
            @RequestParam String classType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate journeyDate,
            @RequestParam Integer numberOfPassengers) {
        
        try {
            Event event = eventRepository.findById(eventId).orElse(null);
            if (event == null) {
                return ResponseEntity.notFound().build();
            }

            // Get base fare for the class type
            Optional<Fare> fareOpt = fareRepository.findActiveFareByEventAndClassType(eventId, classType, journeyDate);
            
            BigDecimal baseFare = event.getSeatPrice();
            BigDecimal reservationCharge = new BigDecimal("40");
            BigDecimal superfastCharge = new BigDecimal("0");
            BigDecimal tatkalCharge = new BigDecimal("0");
            BigDecimal gst = new BigDecimal("0");
            BigDecimal dynamicPricing = new BigDecimal("0");

            if (fareOpt.isPresent()) {
                Fare fare = fareOpt.get();
                baseFare = fare.getBaseFare();
                if (fare.getReservationCharge() != null) reservationCharge = fare.getReservationCharge();
                if (fare.getSuperfastCharge() != null) superfastCharge = fare.getSuperfastCharge();
                if (fare.getTatkalCharge() != null) tatkalCharge = fare.getTatkalCharge();
                if (fare.getDynamicPricing() != null) dynamicPricing = fare.getDynamicPricing();
            }

            // Calculate GST (5% on base fare)
            gst = baseFare.multiply(new BigDecimal("0.05"));

            // Calculate total fare per passenger
            BigDecimal farePerPassenger = baseFare
                .add(reservationCharge)
                .add(superfastCharge)
                .add(tatkalCharge)
                .add(gst)
                .add(dynamicPricing);

            // Calculate total fare for all passengers
            BigDecimal totalFare = farePerPassenger.multiply(new BigDecimal(numberOfPassengers));

            Map<String, Object> response = new HashMap<>();
            response.put("eventId", eventId);
            response.put("classType", classType);
            response.put("journeyDate", journeyDate);
            response.put("numberOfPassengers", numberOfPassengers);
            response.put("baseFare", baseFare);
            response.put("reservationCharge", reservationCharge);
            response.put("superfastCharge", superfastCharge);
            response.put("tatkalCharge", tatkalCharge);
            response.put("gst", gst);
            response.put("dynamicPricing", dynamicPricing);
            response.put("farePerPassenger", farePerPassenger);
            response.put("totalFare", totalFare);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/waitlist-status/{eventId}")
    public ResponseEntity<Map<String, Object>> getWaitlistStatus(
            @PathVariable Long eventId,
            @RequestParam String classType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate journeyDate) {
        
        try {
            List<Waitlist> waitlist = waitlistRepository.findByEvent_IdAndClassTypeAndJourneyDate(eventId, classType, journeyDate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("eventId", eventId);
            response.put("classType", classType);
            response.put("journeyDate", journeyDate);
            response.put("waitlistCount", waitlist.size());
            response.put("waitlistDetails", waitlist.stream()
                .map(w -> Map.of(
                    "waitlistNumber", w.getWaitlistNumber(),
                    "status", w.getStatus(),
                    "numberOfSeats", w.getNumberOfSeats(),
                    "waitlistDate", w.getWaitlistDate()
                ))
                .collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/train-schedule/{eventId}")
    public ResponseEntity<Map<String, Object>> getTrainSchedule(@PathVariable Long eventId) {
        try {
            Event event = eventRepository.findById(eventId).orElse(null);
            if (event == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> schedule = new HashMap<>();
            schedule.put("trainNumber", event.getTrainNumber());
            schedule.put("trainName", event.getName());
            schedule.put("source", event.getSource());
            schedule.put("destination", event.getDestination());
            schedule.put("departureTime", event.getStartTime());
            schedule.put("arrivalTime", event.getEndTime());
            schedule.put("journeyDuration", event.getJourneyDurationMinutes());
            schedule.put("intermediateStations", event.getIntermediateStations());
            schedule.put("platformNumber", event.getPlatformNumber());
            schedule.put("runningDays", event.getRunningDays());

            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/available-classes/{eventId}")
    public ResponseEntity<List<Map<String, Object>>> getAvailableClasses(@PathVariable Long eventId) {
        try {
            List<Coach> coaches = coachRepository.findByEvent_IdOrderByPositionAscIdAsc(eventId);
            
            List<Map<String, Object>> classes = new ArrayList<>();
            Set<String> processedClasses = new HashSet<>();

            for (Coach coach : coaches) {
                if (!processedClasses.contains(coach.getClassType())) {
                    long available = seatRepository.countByCoach_IdAndStatus(coach.getId(), Seat.Status.AVAILABLE);
                    long reserved = seatRepository.countByCoach_IdAndStatus(coach.getId(), Seat.Status.RESERVED);
                    long booked = seatRepository.countByCoach_IdAndStatus(coach.getId(), Seat.Status.BOOKED);
                    long total = available + reserved + booked;

                    Map<String, Object> classInfo = new HashMap<>();
                    classInfo.put("classType", coach.getClassType());
                    classInfo.put("available", available);
                    classInfo.put("reserved", reserved);
                    classInfo.put("booked", booked);
                    classInfo.put("total", total);
                    classInfo.put("coachCode", coach.getCode());

                    classes.add(classInfo);
                    processedClasses.add(coach.getClassType());
                }
            }

            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of(Map.of("error", e.getMessage())));
        }
    }

    @GetMapping("/filters")
    public ResponseEntity<?> getAvailableFilters() {
        return ResponseEntity.ok(Map.of(
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
        return ResponseEntity.ok(List.of(
                Map.of("source", "New Delhi", "destination", "Mumbai Central", "code", "NDLS-BCT"),
                Map.of("source", "Mumbai Central", "destination", "New Delhi", "code", "BCT-NDLS"),
                Map.of("source", "Kolkata", "destination", "New Delhi", "code", "HWH-NDLS"),
                Map.of("source", "Chennai Central", "destination", "Bangalore City", "code", "MAS-SBC"),
                Map.of("source", "Bangalore City", "destination", "Chennai Central", "code", "SBC-MAS")
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
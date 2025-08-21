package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/fare")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FareController {

    private final EventRepository eventRepository;

    @GetMapping("/enquiry")
    public ResponseEntity<?> fare(@RequestParam Long eventId,
                                  @RequestParam(defaultValue = "1") int passengers) {
        return eventRepository.findById(eventId)
                .map(e -> ResponseEntity.ok(calculateFare(e, passengers)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> calculateFare(Event e, int passengers) {
        BigDecimal base = e.getSeatPrice();
        BigDecimal tax = base.multiply(new BigDecimal("0.05"));
        BigDecimal totalPer = base.add(tax);
        BigDecimal grand = totalPer.multiply(BigDecimal.valueOf(passengers));
        return Map.of(
                "trainName", e.getName(),
                "trainNumber", e.getTrainNumber(),
                "source", e.getSource(),
                "destination", e.getDestination(),
                "baseFare", base,
                "tax", tax,
                "totalPerPassenger", totalPer,
                "passengers", passengers,
                "grandTotal", grand
        );
    }
}


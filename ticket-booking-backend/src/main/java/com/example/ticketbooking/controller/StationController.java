package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.Station;
import com.example.ticketbooking.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StationController {

    private final StationRepository stationRepository;

    @GetMapping
    public List<Station> searchStations(@RequestParam(value = "q", required = false) String query) {
        if (query == null || query.trim().isEmpty()) {
            return stationRepository.findAll();
        }
        return stationRepository.searchStations(query.trim());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Station> getStation(@PathVariable Long id) {
        return stationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Station> getStationByCode(@PathVariable String code) {
        return stationRepository.findByCode(code.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cities")
    public List<String> getAllCities() {
        return stationRepository.findAllCities();
    }

    @GetMapping("/states")
    public List<String> getAllStates() {
        return stationRepository.findAllStates();
    }

    @GetMapping("/zones")
    public List<String> getAllZones() {
        return stationRepository.findAllZones();
    }

    @GetMapping("/city/{city}")
    public List<Station> getStationsByCity(@PathVariable String city) {
        return stationRepository.findByCity(city);
    }

    @GetMapping("/state/{state}")
    public List<Station> getStationsByState(@PathVariable String state) {
        return stationRepository.findByState(state);
    }

    @GetMapping("/zone/{zone}")
    public List<Station> getStationsByZone(@PathVariable String zone) {
        return stationRepository.findByZone(zone);
    }

    @GetMapping("/category/{category}")
    public List<Station> getStationsByCategory(@PathVariable String category) {
        return stationRepository.findByCategory(category);
    }

    @GetMapping("/popular")
    public List<Station> getPopularStations() {
        // Return major stations (A1, A category)
        return stationRepository.findByCategory("A1");
    }
}
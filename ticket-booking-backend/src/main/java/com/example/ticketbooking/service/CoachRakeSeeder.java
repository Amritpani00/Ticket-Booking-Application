package com.example.ticketbooking.service;

import com.example.ticketbooking.model.Coach;
import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.repository.CoachRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Profile({"default","dev"})
@Order(0)
public class CoachRakeSeeder implements CommandLineRunner {

    private final EventRepository eventRepository;
    private final CoachRepository coachRepository;
    private final SeatRepository seatRepository;

    @Override
    public void run(String... args) {
        if (eventRepository.count() > 0) return;

        // Seed multiple trains
        createTrain(
                "Rajdhani Express",
                "12951",
                "Mumbai Central",
                "New Delhi",
                BigDecimal.valueOf(1500),
                List.of(
                        coach("A1", "2A", 1, 18, 4),
                        coach("A2", "2A", 2, 18, 4),
                        coach("B1", "3A", 3, 24, 4),
                        coach("B2", "3A", 4, 24, 4),
                        coach("S1", "SL", 5, 36, 6),
                        coach("S2", "SL", 6, 36, 6),
                        coach("GEN1", "GEN", 7, 40, 8)
                )
        );

        createTrain(
                "Shatabdi Express",
                "12009",
                "Mumbai CSMT",
                "Ahmedabad",
                BigDecimal.valueOf(950),
                List.of(
                        coach("EC1", "EC", 1, 18, 4),
                        coach("CC1", "CC", 2, 24, 4),
                        coach("CC2", "CC", 3, 24, 4),
                        coach("GEN1", "GEN", 4, 40, 8)
                )
        );
    }

    private CoachSpec coach(String code, String classType, int position, int rows, int seatsPerRow) {
        return new CoachSpec(code, classType, position, rows, seatsPerRow);
    }

    private void createTrain(String name, String trainNumber, String source, String destination, BigDecimal baseFare, List<CoachSpec> coachSpecs) {
        Event event = Event.builder()
                .name(name)
                .trainNumber(trainNumber)
                .source(source)
                .destination(destination)
                .venue(source)
                .description("Fast service with comfortable seating")
                .startTime(LocalDateTime.now().plusDays(1).withHour(6).withMinute(30))
                .endTime(LocalDateTime.now().plusDays(1).withHour(18).withMinute(45))
                .seatPrice(baseFare)
                .classType("Mixed")
                .build();
        event = eventRepository.save(event);

        List<Coach> coaches = new ArrayList<>();
        for (CoachSpec spec : coachSpecs) {
            Coach c = Coach.builder()
                    .event(event)
                    .code(spec.code)
                    .classType(spec.classType)
                    .position(spec.position)
                    .build();
            coaches.add(c);
        }
        coaches = coachRepository.saveAll(coaches);

        List<Seat> seats = new ArrayList<>();
        for (int i = 0; i < coaches.size(); i++) {
            Coach c = coaches.get(i);
            CoachSpec spec = coachSpecs.get(i);
            for (int r = 0; r < spec.rows; r++) {
                String rowLabel = String.valueOf((char) ('A' + r));
                for (int s = 1; s <= spec.seatsPerRow; s++) {
                    Seat seat = Seat.builder()
                            .event(event)
                            .coach(c)
                            .rowLabel(rowLabel)
                            .seatNumber(s)
                            .status(Seat.Status.AVAILABLE)
                            .build();
                    seats.add(seat);
                }
            }
        }
        seatRepository.saveAll(seats);
    }

    private record CoachSpec(String code, String classType, int position, int rows, int seatsPerRow) {}
}


package com.example.ticketbooking.config;

import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (eventRepository.count() > 0) {
            return;
        }
        Event event = Event.builder()
                .name("Rock Concert")
                .venue("City Arena")
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(2).plusHours(3))
                .seatPrice(new BigDecimal("499.00"))
                .description("An amazing night of rock music")
                .build();
        Event saved = eventRepository.save(event);

        for (char row = 'A'; row <= 'D'; row++) {
            for (int num = 1; num <= 10; num++) {
                Seat seat = Seat.builder()
                        .event(saved)
                        .rowLabel(String.valueOf(row))
                        .seatNumber(num)
                        .status(Seat.Status.AVAILABLE)
                        .build();
                seatRepository.save(seat);
            }
        }
    }
}
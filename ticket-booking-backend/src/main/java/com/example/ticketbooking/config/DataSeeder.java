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
        // Ensure Rock Concert exists
        if (!eventRepository.existsByName("Rock Concert")) {
            Event concert = Event.builder()
                    .name("Rock Concert")
                    .venue("City Arena")
                    .startTime(LocalDateTime.now().plusDays(2))
                    .endTime(LocalDateTime.now().plusDays(2).plusHours(3))
                    .seatPrice(new BigDecimal("499.00"))
                    .description("An amazing night of rock music")
                    .build();
            Event concertSaved = eventRepository.save(concert);

            for (char row = 'A'; row <= 'D'; row++) {
                for (int num = 1; num <= 10; num++) {
                    Seat seat = Seat.builder()
                            .event(concertSaved)
                            .rowLabel(String.valueOf(row))
                            .seatNumber(num)
                            .status(Seat.Status.AVAILABLE)
                            .build();
                    seatRepository.save(seat);
                }
            }
        }

        // Add Train Booking event if missing
        if (!eventRepository.existsByName("Express Train 1234")) {
            Event train = Event.builder()
                    .name("Express Train 1234")
                    .venue("Platform 5, Central Station")
                    .startTime(LocalDateTime.now().plusDays(5).withHour(9).withMinute(30))
                    .endTime(LocalDateTime.now().plusDays(5).withHour(15).withMinute(45))
                    .seatPrice(new BigDecimal("899.00"))
                    .description("Intercity express: Central → Coastal City")
                    .build();
            Event trainSaved = eventRepository.save(train);

            // Coach A-C, 20 seats each
            for (char coach = 'A'; coach <= 'C'; coach++) {
                for (int seatNum = 1; seatNum <= 20; seatNum++) {
                    Seat seat = Seat.builder()
                            .event(trainSaved)
                            .rowLabel(String.valueOf(coach))
                            .seatNumber(seatNum)
                            .status(Seat.Status.AVAILABLE)
                            .build();
                    seatRepository.save(seat);
                }
            }
        }
    }
}
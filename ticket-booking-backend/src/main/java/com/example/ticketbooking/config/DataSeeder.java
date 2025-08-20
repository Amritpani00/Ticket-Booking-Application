package com.example.ticketbooking.config;

import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    @Bean
    CommandLineRunner seedDataRunner() {
        return args -> {
            if (eventRepository.count() > 0) {
                return;
            }

            List<Event> events = new ArrayList<>();

            events.add(Event.builder()
                    .name("Rajdhani Express")
                    .trainNumber("12951")
                    .source("Mumbai Central")
                    .destination("New Delhi")
                    .venue("Indian Railways")
                    .startTime(LocalDateTime.now().plusDays(1).withHour(16).withMinute(30))
                    .endTime(LocalDateTime.now().plusDays(2).withHour(8).withMinute(15))
                    .seatPrice(new BigDecimal("1899.00"))
                    .classType("3A")
                    .description("Premium fast service between Mumbai and Delhi")
                    .build());

            events.add(Event.builder()
                    .name("Gatimaan Express")
                    .trainNumber("12049")
                    .source("Hazrat Nizamuddin")
                    .destination("Jhansi")
                    .venue("Indian Railways")
                    .startTime(LocalDateTime.now().plusDays(1).withHour(8).withMinute(10))
                    .endTime(LocalDateTime.now().plusDays(1).withHour(12).withMinute(35))
                    .seatPrice(new BigDecimal("749.00"))
                    .classType("CC")
                    .description("Semi-high speed chair car service")
                    .build());

            events.add(Event.builder()
                    .name("Shatabdi Express")
                    .trainNumber("12030")
                    .source("Amritsar")
                    .destination("New Delhi")
                    .venue("Indian Railways")
                    .startTime(LocalDateTime.now().plusDays(2).withHour(5).withMinute(0))
                    .endTime(LocalDateTime.now().plusDays(2).withHour(11).withMinute(15))
                    .seatPrice(new BigDecimal("999.00"))
                    .classType("EC")
                    .description("Comfortable daytime travel")
                    .build());

            events.add(Event.builder()
                    .name("Intercity Express")
                    .trainNumber("22625")
                    .source("Chennai Central")
                    .destination("Bengaluru")
                    .venue("Indian Railways")
                    .startTime(LocalDateTime.now().plusDays(1).withHour(6).withMinute(0))
                    .endTime(LocalDateTime.now().plusDays(1).withHour(11).withMinute(30))
                    .seatPrice(new BigDecimal("599.00"))
                    .classType("2S")
                    .description("Daily intercity service")
                    .build());

            List<Event> saved = eventRepository.saveAll(events);

            for (Event ev : saved) {
                // Generate seats: Rows A-F, numbers 1-20
                for (char row = 'A'; row <= 'F'; row++) {
                    for (int num = 1; num <= 20; num++) {
                        Seat seat = Seat.builder()
                                .event(ev)
                                .rowLabel(String.valueOf(row))
                                .seatNumber(num)
                                .status(Seat.Status.AVAILABLE)
                                .build();
                        seatRepository.save(seat);
                    }
                }
            }
        };
    }
}

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
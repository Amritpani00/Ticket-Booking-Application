package com.example.ticketbooking.config;

import com.example.ticketbooking.model.AppUser;
import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.SeatRepository;
import com.example.ticketbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

	private final EventRepository eventRepository;
	private final SeatRepository seatRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	public void run(ApplicationArguments args) throws Exception {
		if (eventRepository.count() == 0) {
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
		}

		if (!userRepository.existsByEmail("admin@example.com")) {
			AppUser admin = AppUser.builder()
					.name("Admin")
					.email("admin@example.com")
					.passwordHash(passwordEncoder.encode("admin123"))
					.createdAt(OffsetDateTime.now())
					.role(AppUser.Role.ADMIN)
					.build();
			userRepository.save(admin);
		}
	}
}
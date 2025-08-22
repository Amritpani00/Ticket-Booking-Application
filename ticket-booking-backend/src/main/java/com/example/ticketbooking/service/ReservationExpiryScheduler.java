package com.example.ticketbooking.service;

import com.example.ticketbooking.model.Booking;
import com.example.ticketbooking.model.Seat;
import com.example.ticketbooking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ReservationExpiryScheduler {

	private final BookingRepository bookingRepository;
	private final SeatUpdateBroadcaster broadcaster;

	@Scheduled(fixedDelay = 60000)
	@Transactional
	public void expireOldReservations() {
		List<Booking> expired = bookingRepository.findByStatusAndReservationExpiresAtBefore(Booking.Status.PENDING_PAYMENT, OffsetDateTime.now());
		if (expired.isEmpty()) return;

		Map<Long, List<Seat>> eventToSeats = new HashMap<>();
		for (Booking b : expired) {
			b.setStatus(Booking.Status.EXPIRED);
			for (Seat s : b.getSeats()) {
				s.setStatus(Seat.Status.AVAILABLE);
				eventToSeats.computeIfAbsent(b.getEvent().getId(), k -> new ArrayList<>()).add(s);
			}
		}
		bookingRepository.saveAll(expired);

		eventToSeats.forEach((eventId, seats) -> broadcaster.broadcastSeatStatus(eventId, seats));
	}
}
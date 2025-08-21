package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingDtos;
import com.example.ticketbooking.model.*;
import com.example.ticketbooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final CoachRepository coachRepository;
    private final PassengerRepository passengerRepository;
    private final WaitlistRepository waitlistRepository;
    private final PNRRepository pnrRepository;

    @PostMapping
    public ResponseEntity<BookingDtos.CreateBookingResponse> createBooking(@RequestBody BookingDtos.CreateBookingRequest request) {
        try {
            Event event = eventRepository.findById(request.getEventId()).orElse(null);
            if (event == null) {
                return ResponseEntity.badRequest().build();
            }

            // Check seat availability
            List<Seat> selectedSeats = seatRepository.findAllById(request.getSeatIds());
            if (selectedSeats.size() != request.getSeatIds().size()) {
                return ResponseEntity.badRequest().build();
            }

            // Verify seats are available
            for (Seat seat : selectedSeats) {
                if (seat.getStatus() != Seat.Status.AVAILABLE) {
                    return ResponseEntity.badRequest().build();
                }
            }

            // Calculate total fare
            BigDecimal totalFare = event.getSeatPrice().multiply(new BigDecimal(selectedSeats.size()));

            // Create booking
            Booking booking = Booking.builder()
                    .event(event)
                    .customerName(request.getCustomerName())
                    .customerEmail(request.getCustomerEmail())
                    .customerPhone(request.getCustomerPhone())
                    .numberOfSeats(selectedSeats.size())
                    .totalAmount(totalFare)
                    .bookingDate(LocalDateTime.now())
                    .status(Booking.Status.CONFIRMED)
                    .build();

            booking = bookingRepository.save(booking);

            // Update seat status
            for (Seat seat : selectedSeats) {
                seat.setStatus(Seat.Status.BOOKED);
                seat.setBooking(booking);
            }
            seatRepository.saveAll(selectedSeats);

            // Create passengers
            List<Passenger> passengers = new ArrayList<>();
            for (int i = 0; i < request.getPassengers().size(); i++) {
                BookingDtos.PassengerInfo passengerInfo = request.getPassengers().get(i);
                Seat seat = selectedSeats.get(i);
                
                Passenger passenger = Passenger.builder()
                        .name(passengerInfo.getName())
                        .age(passengerInfo.getAge())
                        .gender(Passenger.Gender.valueOf(passengerInfo.getGender().toUpperCase()))
                        .idProofType(passengerInfo.getIdProofType())
                        .idProofNumber(passengerInfo.getIdProofNumber())
                        .seatNumber(seat.getRowLabel() + seat.getSeatNumber())
                        .coachCode(seat.getCoach().getCode())
                        .booking(booking)
                        .passengerType(passengerInfo.getPassengerType())
                        .contactNumber(passengerInfo.getContactNumber())
                        .email(passengerInfo.getEmail())
                        .build();
                
                passengers.add(passenger);
            }
            passengerRepository.saveAll(passengers);

            // Generate PNR
            String pnrNumber = generatePNRNumber();
            PNR pnr = PNR.builder()
                    .pnrNumber(pnrNumber)
                    .booking(booking)
                    .pnrGeneratedDate(LocalDateTime.now())
                    .journeyDate(event.getStartTime().toLocalDate())
                    .sourceStation(event.getSource())
                    .destinationStation(event.getDestination())
                    .trainNumber(event.getTrainNumber())
                    .trainName(event.getName())
                    .classType(selectedSeats.get(0).getCoach().getClassType())
                    .numberOfPassengers(passengers.size())
                    .totalFare(totalFare)
                    .seatNumbers(selectedSeats.stream().map(s -> s.getRowLabel() + s.getSeatNumber()).collect(Collectors.joining(",")))
                    .coachCodes(selectedSeats.stream().map(s -> s.getCoach().getCode()).distinct().collect(Collectors.joining(",")))
                    .departureTime(event.getStartTime())
                    .arrivalTime(event.getEndTime())
                    .status(PNR.PNRStatus.CONFIRMED)
                    .chartStatus("Not Prepared")
                    .platformNumber(event.getPlatformNumber())
                    .build();

            pnrRepository.save(pnr);

            // Generate Razorpay order
            String orderId = "order_" + System.currentTimeMillis();
            String razorpayKeyId = "rzp_test_your_key_here"; // Replace with actual key

            BookingDtos.CreateBookingResponse response = BookingDtos.CreateBookingResponse.builder()
                    .bookingId(booking.getId())
                    .orderId(orderId)
                    .razorpayKeyId(razorpayKeyId)
                    .amount(totalFare.doubleValue())
                    .currency("INR")
                    .pnrNumber(pnrNumber)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/waitlist")
    public ResponseEntity<Map<String, Object>> addToWaitlist(@RequestBody BookingDtos.WaitlistRequest request) {
        try {
            Event event = eventRepository.findById(request.getEventId()).orElse(null);
            if (event == null) {
                return ResponseEntity.badRequest().build();
            }

            // Get next waitlist number
            Integer maxWaitlistNumber = waitlistRepository.findMaxWaitlistNumber(
                request.getEventId(), request.getClassType(), request.getJourneyDate());
            int nextWaitlistNumber = (maxWaitlistNumber != null) ? maxWaitlistNumber + 1 : 1;

            // Create waitlist entry
            Waitlist waitlist = Waitlist.builder()
                    .event(event)
                    .user(request.getUserId() != null ? new AppUser(request.getUserId()) : null)
                    .classType(request.getClassType())
                    .numberOfSeats(request.getNumberOfSeats())
                    .waitlistNumber(nextWaitlistNumber)
                    .waitlistDate(LocalDateTime.now())
                    .journeyDate(request.getJourneyDate())
                    .status(Waitlist.WaitlistStatus.WAITING)
                    .build();

            waitlistRepository.save(waitlist);

            Map<String, Object> response = new HashMap<>();
            response.put("waitlistId", waitlist.getId());
            response.put("waitlistNumber", waitlist.getWaitlistNumber());
            response.put("status", "ADDED_TO_WAITLIST");
            response.put("message", "Successfully added to waitlist");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<Map<String, Object>> getBooking(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) {
                return ResponseEntity.notFound().build();
            }

            // Get PNR details
            PNR pnr = pnrRepository.findByBooking_Id(bookingId).orElse(null);
            
            // Get passenger details
            List<Passenger> passengers = passengerRepository.findByBooking_Id(bookingId);
            
            // Get seat details
            List<Seat> seats = seatRepository.findByBooking_Id(bookingId);

            Map<String, Object> response = new HashMap<>();
            response.put("bookingId", booking.getId());
            response.put("pnrNumber", pnr != null ? pnr.getPnrNumber() : null);
            response.put("trainNumber", booking.getEvent().getTrainNumber());
            response.put("trainName", booking.getEvent().getName());
            response.put("source", booking.getEvent().getSource());
            response.put("destination", booking.getEvent().getDestination());
            response.put("journeyDate", pnr != null ? pnr.getJourneyDate() : null);
            response.put("departureTime", booking.getEvent().getStartTime());
            response.put("arrivalTime", booking.getEvent().getEndTime());
            response.put("classType", pnr != null ? pnr.getClassType() : null);
            response.put("numberOfPassengers", passengers.size());
            response.put("totalAmount", booking.getTotalAmount());
            response.put("bookingDate", booking.getBookingDate());
            response.put("status", booking.getStatus());
            response.put("passengers", passengers.stream().map(p -> Map.of(
                "name", p.getName(),
                "age", p.getAge(),
                "gender", p.getGender(),
                "seatNumber", p.getSeatNumber(),
                "coachCode", p.getCoachCode(),
                "idProofType", p.getIdProofType(),
                "idProofNumber", p.getIdProofNumber()
            )).collect(Collectors.toList()));
            response.put("seats", seats.stream().map(s -> Map.of(
                "seatNumber", s.getRowLabel() + s.getSeatNumber(),
                "coachCode", s.getCoach().getCode(),
                "classType", s.getCoach().getClassType()
            )).collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/pnr/{pnrNumber}")
    public ResponseEntity<Map<String, Object>> getBookingByPNR(@PathVariable String pnrNumber) {
        try {
            PNR pnr = pnrRepository.findByPnrNumber(pnrNumber).orElse(null);
            if (pnr == null) {
                return ResponseEntity.notFound().build();
            }

            return getBooking(pnr.getBooking().getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> request) {
        try {
            Long bookingId = Long.parseLong(request.get("bookingId"));
            String razorpayOrderId = request.get("razorpayOrderId");
            String razorpayPaymentId = request.get("razorpayPaymentId");
            String razorpaySignature = request.get("razorpaySignature");

            // Here you would verify the Razorpay signature
            // For now, we'll just mark the booking as paid

            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) {
                return ResponseEntity.notFound().build();
            }

            booking.setStatus(Booking.Status.CONFIRMED);
            bookingRepository.save(booking);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "PAYMENT_VERIFIED");
            response.put("message", "Payment verified successfully");
            response.put("bookingId", bookingId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) {
                return ResponseEntity.notFound().build();
            }

            // Update seat status
            List<Seat> seats = seatRepository.findByBooking_Id(bookingId);
            for (Seat seat : seats) {
                seat.setStatus(Seat.Status.AVAILABLE);
                seat.setBooking(null);
            }
            seatRepository.saveAll(seats);

            // Update booking status
            booking.setStatus(Booking.Status.CANCELLED);
            bookingRepository.save(booking);

            // Update PNR status
            Optional<PNR> pnrOpt = pnrRepository.findByBooking_Id(bookingId);
            if (pnrOpt.isPresent()) {
                PNR pnr = pnrOpt.get();
                pnr.setStatus(PNR.PNRStatus.CANCELLED);
                pnrRepository.save(pnr);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "CANCELLED");
            response.put("message", "Booking cancelled successfully");
            response.put("bookingId", bookingId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String generatePNRNumber() {
        // Generate a 10-digit PNR number
        Random random = new Random();
        StringBuilder pnr = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            pnr.append(random.nextInt(10));
        }
        return pnr.toString();
    }
}
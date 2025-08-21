package com.example.ticketbooking.service;

import com.example.ticketbooking.model.*;
import com.example.ticketbooking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataSeederService implements CommandLineRunner {

    private final StationRepository stationRepository;
    private final EventRepository eventRepository;
    private final TrainScheduleRepository trainScheduleRepository;
    private final FareRepository fareRepository;
    private final CoachRepository coachRepository;
    private final SeatRepository seatRepository;

    @Override
    public void run(String... args) throws Exception {
        if (stationRepository.count() == 0) {
            seedStations();
        }
        if (eventRepository.count() == 0) {
            seedTrains();
        }
        log.info("Data seeding completed");
    }

    private void seedStations() {
        List<Station> stations = Arrays.asList(
            // Major stations
            Station.builder()
                .code("NDLS")
                .name("New Delhi")
                .city("New Delhi")
                .state("Delhi")
                .zone("NR")
                .category("A1")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(true)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(true)
                .hasElevator(true)
                .platformCount("16")
                .stationType("Junction")
                .latitude(28.6139)
                .longitude(77.2090)
                .build(),

            Station.builder()
                .code("BCT")
                .name("Mumbai Central")
                .city("Mumbai")
                .state("Maharashtra")
                .zone("WR")
                .category("A1")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(true)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(true)
                .hasElevator(true)
                .platformCount("12")
                .stationType("Terminal")
                .latitude(19.0760)
                .longitude(72.8777)
                .build(),

            Station.builder()
                .code("HWH")
                .name("Howrah Junction")
                .city("Kolkata")
                .state("West Bengal")
                .zone("ER")
                .category("A1")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(true)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(true)
                .hasElevator(true)
                .platformCount("23")
                .stationType("Junction")
                .latitude(22.5726)
                .longitude(88.3639)
                .build(),

            Station.builder()
                .code("MAS")
                .name("Chennai Central")
                .city("Chennai")
                .state("Tamil Nadu")
                .zone("SR")
                .category("A1")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(true)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(true)
                .hasElevator(true)
                .platformCount("17")
                .stationType("Terminal")
                .latitude(13.0827)
                .longitude(80.2707)
                .build(),

            Station.builder()
                .code("SBC")
                .name("Bangalore City Junction")
                .city("Bangalore")
                .state("Karnataka")
                .zone("SWR")
                .category("A1")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(true)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(true)
                .hasElevator(true)
                .platformCount("10")
                .stationType("Junction")
                .latitude(12.9716)
                .longitude(77.5946)
                .build(),

            Station.builder()
                .code("PNBE")
                .name("Patna Junction")
                .city("Patna")
                .state("Bihar")
                .zone("ECR")
                .category("A")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(false)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(false)
                .hasElevator(false)
                .platformCount("8")
                .stationType("Junction")
                .latitude(25.5941)
                .longitude(85.1376)
                .build(),

            Station.builder()
                .code("LKO")
                .name("Lucknow Charbagh")
                .city("Lucknow")
                .state("Uttar Pradesh")
                .zone("NR")
                .category("A")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(true)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(true)
                .hasElevator(true)
                .platformCount("9")
                .stationType("Junction")
                .latitude(26.8467)
                .longitude(80.9462)
                .build(),

            Station.builder()
                .code("JHS")
                .name("Jhansi Junction")
                .city("Jhansi")
                .state("Uttar Pradesh")
                .zone("NCR")
                .category("A")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(false)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(false)
                .hasElevator(false)
                .platformCount("7")
                .stationType("Junction")
                .latitude(25.4589)
                .longitude(78.5799)
                .build(),

            // Additional stations for new trains
            Station.builder()
                .code("ADI")
                .name("Ahmedabad Junction")
                .city("Ahmedabad")
                .state("Gujarat")
                .zone("WR")
                .category("A1")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(true)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(true)
                .hasElevator(true)
                .platformCount("14")
                .stationType("Junction")
                .latitude(23.0225)
                .longitude(72.5714)
                .build(),

            Station.builder()
                .code("HYB")
                .name("Hyderabad Deccan")
                .city("Hyderabad")
                .state("Telangana")
                .zone("SCR")
                .category("A1")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(true)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(true)
                .hasElevator(true)
                .platformCount("10")
                .stationType("Junction")
                .latitude(17.3850)
                .longitude(78.4867)
                .build(),

            Station.builder()
                .code("BLR")
                .name("Bangalore Cantonment")
                .city("Bangalore")
                .state("Karnataka")
                .zone("SWR")
                .category("A")
                .hasACWaitingRoom(true)
                .hasNonACWaitingRoom(true)
                .hasRetiringRoom(false)
                .hasFoodCourt(true)
                .hasParking(true)
                .hasEscalator(false)
                .hasElevator(false)
                .platformCount("6")
                .stationType("Junction")
                .latitude(12.9716)
                .longitude(77.5946)
                .build()
        );

        stationRepository.saveAll(stations);
        log.info("Seeded {} stations", stations.size());
    }

    private void seedTrains() {
        // Get stations
        Station ndls = stationRepository.findByCode("NDLS").orElseThrow();
        Station bct = stationRepository.findByCode("BCT").orElseThrow();
        Station hwh = stationRepository.findByCode("HWH").orElseThrow();
        Station mas = stationRepository.findByCode("MAS").orElseThrow();
        Station sbc = stationRepository.findByCode("SBC").orElseThrow();
        Station pnbe = stationRepository.findByCode("PNBE").orElseThrow();
        Station lko = stationRepository.findByCode("LKO").orElseThrow();
        Station jhs = stationRepository.findByCode("JHS").orElseThrow();
        Station adi = stationRepository.findByCode("ADI").orElseThrow();
        Station hyb = stationRepository.findByCode("HYB").orElseThrow();
        Station blr = stationRepository.findByCode("BLR").orElseThrow();

        List<Event> trains = Arrays.asList(
            // Rajdhani Express - NDLS to BCT
            Event.builder()
                .name("Rajdhani Express")
                .trainNumber("12951")
                .source("New Delhi")
                .destination("Mumbai Central")
                .venue("New Delhi to Mumbai Central")
                .startTime(LocalDateTime.now().withHour(16).withMinute(55).withSecond(0))
                .endTime(LocalDateTime.now().plusDays(1).withHour(8).withMinute(35).withSecond(0))
                .seatPrice(new BigDecimal("2500"))
                .classType("3A")
                .trainType("Rajdhani")
                .trainCategory("Premium")
                .platformNumber("1")
                .totalCoaches(18)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Mathura Junction, Kota Junction, Vadodara Junction, Surat")
                .journeyDurationMinutes(940)
                .hasPantry(true)
                .hasAC(true)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(80)
                .trainStatus("On Time")
                .build(),

            // Duronto Express - NDLS to HWH
            Event.builder()
                .name("Duronto Express")
                .trainNumber("12213")
                .source("New Delhi")
                .destination("Howrah Junction")
                .venue("New Delhi to Howrah Junction")
                .startTime(LocalDateTime.now().withHour(23).withMinute(0).withSecond(0))
                .endTime(LocalDateTime.now().plusDays(1).withHour(22).withMinute(30).withSecond(0))
                .seatPrice(new BigDecimal("1800"))
                .classType("SL")
                .trainType("Duronto")
                .trainCategory("Premium")
                .platformNumber("2")
                .totalCoaches(20)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Kanpur Central, Allahabad Junction, Patna Junction, Asansol")
                .journeyDurationMinutes(1410)
                .hasPantry(true)
                .hasAC(false)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(75)
                .trainStatus("On Time")
                .build(),

            // Shatabdi Express - NDLS to LKO
            Event.builder()
                .name("Shatabdi Express")
                .trainNumber("12004")
                .source("New Delhi")
                .destination("Lucknow Charbagh")
                .venue("New Delhi to Lucknow Charbagh")
                .startTime(LocalDateTime.now().withHour(6).withMinute(0).withSecond(0))
                .endTime(LocalDateTime.now().withHour(13).withMinute(30).withSecond(0))
                .seatPrice(new BigDecimal("1200"))
                .classType("CC")
                .trainType("Shatabdi")
                .trainCategory("Premium")
                .platformNumber("3")
                .totalCoaches(12)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Ghaziabad, Aligarh Junction, Kanpur Central")
                .journeyDurationMinutes(450)
                .hasPantry(true)
                .hasAC(true)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(90)
                .trainStatus("On Time")
                .build(),

            // Garib Rath - NDLS to MAS
            Event.builder()
                .name("Garib Rath Express")
                .trainNumber("12213")
                .source("New Delhi")
                .destination("Chennai Central")
                .venue("New Delhi to Chennai Central")
                .startTime(LocalDateTime.now().withHour(20).withMinute(30).withSecond(0))
                .endTime(LocalDateTime.now().plusDays(2).withHour(5).withMinute(45).withSecond(0))
                .seatPrice(new BigDecimal("800"))
                .classType("3A")
                .trainType("Garib Rath")
                .trainCategory("Economy")
                .platformNumber("4")
                .totalCoaches(22)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Jhansi Junction, Bhopal Junction, Nagpur, Secunderabad")
                .journeyDurationMinutes(2175)
                .hasPantry(false)
                .hasAC(true)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(70)
                .trainStatus("On Time")
                .build(),

            // Superfast Express - BCT to NDLS
            Event.builder()
                .name("Mumbai Central - New Delhi Superfast")
                .trainNumber("12952")
                .source("Mumbai Central")
                .destination("New Delhi")
                .venue("Mumbai Central to New Delhi")
                .startTime(LocalDateTime.now().withHour(17).withMinute(30).withSecond(0))
                .endTime(LocalDateTime.now().plusDays(1).withHour(9).withMinute(15).withSecond(0))
                .seatPrice(new BigDecimal("2200"))
                .classType("SL")
                .trainType("Superfast")
                .trainCategory("Regular")
                .platformNumber("1")
                .totalCoaches(24)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Surat, Vadodara Junction, Kota Junction, Mathura Junction")
                .journeyDurationMinutes(945)
                .hasPantry(true)
                .hasAC(false)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(75)
                .trainStatus("On Time")
                .build(),

            // Express - HWH to NDLS
            Event.builder()
                .name("Howrah - New Delhi Express")
                .trainNumber("12301")
                .source("Howrah Junction")
                .destination("New Delhi")
                .venue("Howrah Junction to New Delhi")
                .startTime(LocalDateTime.now().withHour(22).withMinute(45).withSecond(0))
                .endTime(LocalDateTime.now().plusDays(1).withHour(23).withMinute(30).withSecond(0))
                .seatPrice(new BigDecimal("1600"))
                .classType("2A")
                .trainType("Express")
                .trainCategory("Regular")
                .platformNumber("2")
                .totalCoaches(18)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Asansol, Patna Junction, Allahabad Junction, Kanpur Central")
                .journeyDurationMinutes(1425)
                .hasPantry(true)
                .hasAC(true)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(70)
                .trainStatus("On Time")
                .build(),

            // Passenger - SBC to MAS
            Event.builder()
                .name("Bangalore - Chennai Passenger")
                .trainNumber("56501")
                .source("Bangalore City Junction")
                .destination("Chennai Central")
                .venue("Bangalore City Junction to Chennai Central")
                .startTime(LocalDateTime.now().withHour(6).withMinute(30).withSecond(0))
                .endTime(LocalDateTime.now().withHour(18).withMinute(45).withSecond(0))
                .seatPrice(new BigDecimal("350"))
                .classType("2S")
                .trainType("Passenger")
                .trainCategory("Economy")
                .platformNumber("3")
                .totalCoaches(16)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Bangalore Cantonment, Jolarpettai, Katpadi Junction, Arakkonam")
                .journeyDurationMinutes(735)
                .hasPantry(false)
                .hasAC(false)
                .trainOperator("IRCTC")
                .routeType("Branch Line")
                .averageSpeed(45)
                .trainStatus("On Time")
                .build(),

            // Local - PNBE to LKO
            Event.builder()
                .name("Patna - Lucknow Local")
                .trainNumber("15001")
                .source("Patna Junction")
                .destination("Lucknow Charbagh")
                .venue("Patna Junction to Lucknow Charbagh")
                .startTime(LocalDateTime.now().withHour(8).withMinute(15).withSecond(0))
                .endTime(LocalDateTime.now().withHour(16).withMinute(30).withSecond(0))
                .seatPrice(new BigDecimal("180"))
                .classType("GEN")
                .trainType("Local")
                .trainCategory("Economy")
                .platformNumber("4")
                .totalCoaches(14)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Buxar, Mughalsarai, Varanasi, Rae Bareli")
                .journeyDurationMinutes(495)
                .hasPantry(false)
                .hasAC(false)
                .trainOperator("IRCTC")
                .routeType("Branch Line")
                .averageSpeed(40)
                .trainStatus("On Time")
                .build(),

            // NEW TRAIN 1: Premium AC Express - NDLS to ADI
            Event.builder()
                .name("Ahmedabad Premium AC Express")
                .trainNumber("12953")
                .source("New Delhi")
                .destination("Ahmedabad Junction")
                .venue("New Delhi to Ahmedabad Junction")
                .startTime(LocalDateTime.now().withHour(19).withMinute(30).withSecond(0))
                .endTime(LocalDateTime.now().plusDays(1).withHour(7).withMinute(45).withSecond(0))
                .seatPrice(new BigDecimal("3200"))
                .classType("2A")
                .trainType("Premium AC")
                .trainCategory("Premium")
                .platformNumber("5")
                .totalCoaches(16)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Mathura Junction, Kota Junction, Udaipur City, Palanpur Junction")
                .journeyDurationMinutes(735)
                .hasPantry(true)
                .hasAC(true)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(85)
                .trainStatus("On Time")
                .build(),

            // NEW TRAIN 2: Hyderabad Superfast - NDLS to HYB
            Event.builder()
                .name("Hyderabad Superfast Express")
                .trainNumber("12723")
                .source("New Delhi")
                .destination("Hyderabad Deccan")
                .venue("New Delhi to Hyderabad Deccan")
                .startTime(LocalDateTime.now().withHour(21).withMinute(15).withSecond(0))
                .endTime(LocalDateTime.now().plusDays(1).withHour(23).withMinute(30).withSecond(0))
                .seatPrice(new BigDecimal("2800"))
                .classType("3A")
                .trainType("Superfast")
                .trainCategory("Premium")
                .platformNumber("6")
                .totalCoaches(20)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Jhansi Junction, Bhopal Junction, Nagpur, Secunderabad")
                .journeyDurationMinutes(1575)
                .hasPantry(true)
                .hasAC(true)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(75)
                .trainStatus("On Time")
                .build(),

            // NEW TRAIN 3: Bangalore Express - NDLS to SBC
            Event.builder()
                .name("Bangalore Express")
                .trainNumber("12577")
                .source("New Delhi")
                .destination("Bangalore City Junction")
                .venue("New Delhi to Bangalore City Junction")
                .startTime(LocalDateTime.now().withHour(18).withMinute(45).withSecond(0))
                .endTime(LocalDateTime.now().plusDays(2).withHour(8).withMinute(15).withSecond(0))
                .seatPrice(new BigDecimal("1900"))
                .classType("SL")
                .trainType("Express")
                .trainCategory("Regular")
                .platformNumber("7")
                .totalCoaches(22)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Jhansi Junction, Bhopal Junction, Nagpur, Secunderabad, Bangalore Cantonment")
                .journeyDurationMinutes(2070)
                .hasPantry(true)
                .hasAC(false)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(65)
                .trainStatus("On Time")
                .build(),

            // NEW TRAIN 4: Chennai Premium - BCT to MAS
            Event.builder()
                .name("Mumbai - Chennai Premium Express")
                .trainNumber("12967")
                .source("Mumbai Central")
                .destination("Chennai Central")
                .venue("Mumbai Central to Chennai Central")
                .startTime(LocalDateTime.now().withHour(20).withMinute(0).withSecond(0))
                .endTime(LocalDateTime.now().plusDays(2).withHour(6).withMinute(30).withSecond(0))
                .seatPrice(new BigDecimal("2400"))
                .classType("2A")
                .trainType("Premium Express")
                .trainCategory("Premium")
                .platformNumber("8")
                .totalCoaches(18)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Surat, Vadodara Junction, Nagpur, Secunderabad, Katpadi Junction")
                .journeyDurationMinutes(1890)
                .hasPantry(true)
                .hasAC(true)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(70)
                .trainStatus("On Time")
                .build(),

            // NEW TRAIN 5: Kolkata Premium - BCT to HWH
            Event.builder()
                .name("Mumbai - Kolkata Premium Express")
                .trainNumber("12859")
                .source("Mumbai Central")
                .destination("Howrah Junction")
                .venue("Mumbai Central to Howrah Junction")
                .startTime(LocalDateTime.now().withHour(22).withMinute(30).withSecond(0))
                .endTime(LocalDateTime.now().plusDays(2).withHour(12).withMinute(45).withSecond(0))
                .seatPrice(new BigDecimal("2100"))
                .classType("3A")
                .trainType("Premium Express")
                .trainCategory("Premium")
                .platformNumber("9")
                .totalCoaches(20)
                .runningDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                .isRunningToday(true)
                .intermediateStations("Surat, Vadodara Junction, Nagpur, Bilaspur, Asansol")
                .journeyDurationMinutes(2055)
                .hasPantry(true)
                .hasAC(true)
                .trainOperator("IRCTC")
                .routeType("Main Line")
                .averageSpeed(68)
                .trainStatus("On Time")
                .build()
        );

        eventRepository.saveAll(trains);
        log.info("Seeded {} trains", trains.size());

        // Seed coaches and seats for each train
        for (Event train : trains) {
            seedCoachesAndSeats(train);
        }
    }

    private void seedCoachesAndSeats(Event train) {
        List<Coach> coaches = Arrays.asList(
            Coach.builder()
                .event(train)
                .code("A1")
                .classType("1A")
                .position(1)
                .build(),
            Coach.builder()
                .event(train)
                .code("A2")
                .classType("2A")
                .position(2)
                .build(),
            Coach.builder()
                .event(train)
                .code("A3")
                .classType("3A")
                .position(3)
                .build(),
            Coach.builder()
                .event(train)
                .code("S1")
                .classType("SL")
                .position(4)
                .build(),
            Coach.builder()
                .event(train)
                .code("S2")
                .classType("SL")
                .position(5)
                .build(),
            Coach.builder()
                .event(train)
                .code("G1")
                .classType("GEN")
                .position(6)
                .build()
        );

        coachRepository.saveAll(coaches);

        // Create seats for each coach
        for (Coach coach : coaches) {
            List<Seat> seats = createSeatsForCoach(coach);
            seatRepository.saveAll(seats);
        }
    }

    private List<Seat> createSeatsForCoach(Coach coach) {
        List<Seat> seats = new java.util.ArrayList<>();
        String[] rowLabels = {"A", "B", "C", "D", "E", "F", "G", "H"};
        
        for (String rowLabel : rowLabels) {
            for (int seatNum = 1; seatNum <= 8; seatNum++) {
                seats.add(Seat.builder()
                    .coach(coach)
                    .event(coach.getEvent())
                    .rowLabel(rowLabel)
                    .seatNumber(seatNum)
                    .status(Seat.Status.AVAILABLE)
                    .build());
            }
        }
        
        return seats;
    }
}
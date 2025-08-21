package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.TrainSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.List;

public interface TrainScheduleRepository extends JpaRepository<TrainSchedule, Long> {

    List<TrainSchedule> findByEvent_IdOrderBySequenceNumberAsc(Long eventId);

    @Query("SELECT ts FROM TrainSchedule ts WHERE ts.event.id = :eventId AND ts.station.code = :stationCode")
    List<TrainSchedule> findByEventIdAndStationCode(@Param("eventId") Long eventId, @Param("stationCode") String stationCode);

    @Query("SELECT ts FROM TrainSchedule ts WHERE ts.event.id = :eventId AND ts.isSource = true")
    TrainSchedule findSourceStationByEventId(@Param("eventId") Long eventId);

    @Query("SELECT ts FROM TrainSchedule ts WHERE ts.event.id = :eventId AND ts.isDestination = true")
    TrainSchedule findDestinationStationByEventId(@Param("eventId") Long eventId);

    @Query("SELECT ts FROM TrainSchedule ts WHERE ts.event.id = :eventId AND ts.departureTime >= :time ORDER BY ts.departureTime")
    List<TrainSchedule> findUpcomingStopsByEventId(@Param("eventId") Long eventId, @Param("time") LocalTime time);

    @Query("SELECT ts FROM TrainSchedule ts WHERE ts.event.id = :eventId AND ts.arrivalTime <= :time ORDER BY ts.arrivalTime DESC")
    List<TrainSchedule> findPreviousStopsByEventId(@Param("eventId") Long eventId, @Param("time") LocalTime time);

    @Query("SELECT ts FROM TrainSchedule ts WHERE ts.station.code = :stationCode ORDER BY ts.departureTime")
    List<TrainSchedule> findByStationCode(@Param("stationCode") String stationCode);
}
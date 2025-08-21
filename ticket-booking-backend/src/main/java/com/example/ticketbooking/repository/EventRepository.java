package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("select e from Event e where lower(e.name) like lower(concat('%', ?1, '%')) or lower(e.venue) like lower(concat('%', ?1, '%')) order by e.startTime")
    List<Event> searchByText(String text);

    @Query("select e from Event e where lower(e.source) like lower(concat('%', ?1, '%')) and lower(e.destination) like lower(concat('%', ?2, '%')) order by e.startTime")
    List<Event> searchByRoute(String source, String destination);

    @Query("select e from Event e where lower(e.source) like lower(concat('%', ?1, '%')) and lower(e.destination) like lower(concat('%', ?2, '%')) and cast(e.startTime as date) = ?3 order by e.startTime")
    List<Event> searchByRouteAndDate(String source, String destination, LocalDate date);

    @Query("select e from Event e where lower(e.source) like lower(concat('%', ?1, '%')) and lower(e.destination) like lower(concat('%', ?2, '%')) and cast(e.startTime as date) = ?3 and e.isRunningToday = true order by e.startTime")
    List<Event> searchByRouteAndDateRunningToday(String source, String destination, LocalDate date);

    @Query("select e from Event e where e.trainType = ?1 order by e.startTime")
    List<Event> findByTrainType(String trainType);

    @Query("select e from Event e where e.trainCategory = ?1 order by e.startTime")
    List<Event> findByTrainCategory(String trainCategory);

    @Query("select e from Event e where e.hasAC = ?1 order by e.startTime")
    List<Event> findByACAvailability(Boolean hasAC);

    @Query("select e from Event e where e.trainOperator = ?1 order by e.startTime")
    List<Event> findByTrainOperator(String trainOperator);

    @Query("select e from Event e where cast(e.startTime as date) = ?1 order by e.startTime")
    List<Event> findByDate(LocalDate date);

    @Query("select e from Event e where cast(e.startTime as date) = ?1 and e.isRunningToday = true order by e.startTime")
    List<Event> findByDateRunningToday(LocalDate date);

    @Query("select e from Event e where e.source = ?1 and e.destination = ?2 and cast(e.startTime as date) = ?3 and e.isRunningToday = true order by e.startTime")
    List<Event> findTrainsByRouteAndDate(String source, String destination, LocalDate date);

    @Query("select e from Event e where e.trainNumber = ?1")
    List<Event> findByTrainNumber(String trainNumber);

    @Query("select e from Event e where e.trainStatus = ?1 order by e.startTime")
    List<Event> findByTrainStatus(String trainStatus);

    @Query("select e from Event e where e.averageSpeed >= ?1 order by e.averageSpeed desc")
    List<Event> findByMinimumSpeed(Integer minSpeed);

    @Query("select distinct e.trainType from Event e where e.trainType is not null order by e.trainType")
    List<String> findAllTrainTypes();

    @Query("select distinct e.trainCategory from Event e where e.trainCategory is not null order by e.trainCategory")
    List<String> findAllTrainCategories();

    @Query("select distinct e.trainOperator from Event e where e.trainOperator is not null order by e.trainOperator")
    List<String> findAllTrainOperators();

    boolean existsByName(String name);
}
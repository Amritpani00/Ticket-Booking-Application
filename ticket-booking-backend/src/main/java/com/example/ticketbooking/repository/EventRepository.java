package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("select e from Event e where lower(e.name) like lower(concat('%', ?1, '%')) or lower(e.venue) like lower(concat('%', ?1, '%')) order by e.startTime")
    List<Event> searchByText(String text);
}
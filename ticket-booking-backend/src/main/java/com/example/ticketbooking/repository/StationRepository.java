package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StationRepository extends JpaRepository<Station, Long> {

    Optional<Station> findByCode(String code);

    Optional<Station> findByName(String name);

    @Query("SELECT s FROM Station s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.code) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Station> searchStations(@Param("query") String query);

    @Query("SELECT s FROM Station s WHERE LOWER(s.city) LIKE LOWER(CONCAT('%', :city, '%'))")
    List<Station> findByCity(@Param("city") String city);

    @Query("SELECT s FROM Station s WHERE LOWER(s.state) LIKE LOWER(CONCAT('%', :state, '%'))")
    List<Station> findByState(@Param("state") String state);

    @Query("SELECT s FROM Station s WHERE s.zone = :zone")
    List<Station> findByZone(@Param("zone") String zone);

    @Query("SELECT s FROM Station s WHERE s.category = :category")
    List<Station> findByCategory(@Param("category") String category);

    @Query("SELECT DISTINCT s.city FROM Station s ORDER BY s.city")
    List<String> findAllCities();

    @Query("SELECT DISTINCT s.state FROM Station s ORDER BY s.state")
    List<String> findAllStates();

    @Query("SELECT DISTINCT s.zone FROM Station s ORDER BY s.zone")
    List<String> findAllZones();
}
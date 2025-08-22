package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.SavedSearch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedSearchRepository extends JpaRepository<SavedSearch, Long> {
	List<SavedSearch> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
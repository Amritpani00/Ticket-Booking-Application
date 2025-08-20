package com.example.ticketbooking.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EventDtos {

    @Getter
    @Setter
    @Builder
    public static class EventResponse {
        private Long id;
        private String name;
        private String trainNumber;
        private String source;
        private String destination;
        private String venue;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private BigDecimal seatPrice;
        private String classType;
    }
}


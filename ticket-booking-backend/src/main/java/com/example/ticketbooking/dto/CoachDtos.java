package com.example.ticketbooking.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CoachDtos {

    @Getter
    @Setter
    @Builder
    public static class CoachResponse {
        private Long id;
        private String code;
        private String classType;
        private long available;
        private long reserved;
        private long booked;
        private long total;
    }
}


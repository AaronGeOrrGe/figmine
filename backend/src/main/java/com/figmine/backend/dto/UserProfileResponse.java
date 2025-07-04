package com.figmine.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private boolean onboardingComplete;
}

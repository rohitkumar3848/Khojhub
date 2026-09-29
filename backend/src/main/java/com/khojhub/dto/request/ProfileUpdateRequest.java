package com.khojhub.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {

    private String fullName;
    private String department;
    private String organization;
    private String officeLocation;
    private String phoneNumber;
    private String avatarUrl;
}

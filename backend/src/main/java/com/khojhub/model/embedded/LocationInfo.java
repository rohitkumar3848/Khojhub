package com.khojhub.model.embedded;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationInfo {
    private String city;
    private String campus;
    private String building;
    private String floor;
    private String areaDetails;
}

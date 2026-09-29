package com.khojhub.model.embedded;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DropLocationInfo {
    private String name;
    private String building;
    private String floor;
    private String roomOrDesk;
    private String instructions;
}

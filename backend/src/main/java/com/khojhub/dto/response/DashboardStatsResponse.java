package com.khojhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalUsers;
    private long totalLostItems;
    private long totalFoundItems;
    private long pendingApprovals;
    private long activeClaims;
    private long itemsReturned;
    private long pendingPickup;
    private double totalRewardAmount;
    private long totalKarmaPoints;
}

package com.khojhub.controller;

import com.khojhub.dto.request.RewardRequest;
import com.khojhub.dto.response.ApiResponse;
import com.khojhub.dto.response.RewardResponse;
import com.khojhub.model.entity.User;
import com.khojhub.security.SecurityUtils;
import com.khojhub.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
@Tag(name = "Gratitude & Rewards", description = "Endpoints for optional finder gratitude payments and karma goodwill awards")
public class RewardController {

    private final RewardService rewardService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @Operation(summary = "Submit gratitude reward payment or skip for goodwill karma points")
    public ResponseEntity<ApiResponse<RewardResponse>> processReward(@Valid @RequestBody RewardRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        RewardResponse response = rewardService.processReward(request, currentUser);
        String msg = response.isGoodwillOnly()
                ? "Goodwill gratitude recorded! Finder received +" + response.getKarmaPointsAwarded() + " Karma points."
                : "Gratitude payment of ₹" + response.getTotalAmount() + " processed successfully!";
        return ResponseEntity.ok(ApiResponse.ok(response, msg));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's gratitude and reward history")
    public ResponseEntity<ApiResponse<List<RewardResponse>>> getMyRewards() {
        User currentUser = securityUtils.getCurrentUser();
        List<RewardResponse> list = rewardService.getMyRewards(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(list, "Reward history retrieved"));
    }
}

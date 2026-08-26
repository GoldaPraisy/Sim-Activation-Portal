package com.simportal.controller;

import com.simportal.entity.Plan;
import com.simportal.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanRepository planRepository;

    @GetMapping
    public ResponseEntity<List<Plan>> getAllPlans() {
        return ResponseEntity.ok(planRepository.findAll());
    }

    @GetMapping("/{network}")
    public ResponseEntity<List<Plan>> getPlansByNetwork(@PathVariable String network) {
        return ResponseEntity.ok(planRepository.findByNetworkNameIgnoreCase(network));
    }
}

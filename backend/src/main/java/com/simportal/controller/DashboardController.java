package com.simportal.controller;

import com.simportal.entity.SimCard.SimStatus;
import com.simportal.service.ActivationService;
import com.simportal.service.CustomerService;
import com.simportal.service.SimCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SimCardService simCardService;
    private final CustomerService customerService;
    private final ActivationService activationService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSims", simCardService.getTotalCount());
        stats.put("availableSims", simCardService.countByStatus(SimStatus.AVAILABLE));
        stats.put("activatedSims", simCardService.countByStatus(SimStatus.ACTIVATED));
        stats.put("deactivatedSims", simCardService.countByStatus(SimStatus.DEACTIVATED));
        stats.put("totalCustomers", customerService.getTotalCount());
        stats.put("totalActivations", activationService.getTotalCount());
        return ResponseEntity.ok(stats);
    }
}

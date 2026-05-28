package com.simportal.controller;

import com.simportal.entity.Activation;
import com.simportal.service.ActivationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activations")
@RequiredArgsConstructor
public class ActivationController {

    private final ActivationService activationService;

    @GetMapping
    public ResponseEntity<List<Activation>> getAllActivations() {
        return ResponseEntity.ok(activationService.getAllActivations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Activation> getActivationById(@PathVariable Long id) {
        return ResponseEntity.ok(activationService.getActivationById(id));
    }

    @PostMapping
    public ResponseEntity<Activation> activateSim(@RequestBody Map<String, Object> request) {
        Long simCardId = Long.valueOf(request.get("simCardId").toString());
        Long customerId = Long.valueOf(request.get("customerId").toString());
        String plan = request.get("plan").toString();
        return ResponseEntity.ok(activationService.activateSim(simCardId, customerId, plan));
    }

    @PostMapping("/public")
    public ResponseEntity<Activation> publicActivate(@RequestBody Map<String, String> request) {
        String msisdn = request.get("msisdn");
        String network = request.get("network");
        String plan = request.get("plan");
        return ResponseEntity.ok(activationService.publicActivate(msisdn, network, plan));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Activation>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(activationService.getActivationsByCustomer(customerId));
    }
}

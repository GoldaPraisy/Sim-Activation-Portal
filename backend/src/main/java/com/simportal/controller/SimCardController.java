package com.simportal.controller;

import com.simportal.entity.SimCard;
import com.simportal.entity.SimCard.SimStatus;
import com.simportal.service.SimCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sims")
@RequiredArgsConstructor
public class SimCardController {

    private final SimCardService simCardService;

    @GetMapping
    public ResponseEntity<List<SimCard>> getAllSims() {
        return ResponseEntity.ok(simCardService.getAllSimCards());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SimCard> getSimById(@PathVariable Long id) {
        return ResponseEntity.ok(simCardService.getSimCardById(id));
    }

    @GetMapping("/available")
    public ResponseEntity<List<SimCard>> getAvailableSims() {
        return ResponseEntity.ok(simCardService.getAvailableSimCards());
    }

    @PostMapping
    public ResponseEntity<SimCard> createSim(@RequestBody SimCard simCard) {
        return ResponseEntity.ok(simCardService.createSimCard(simCard));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SimCard> updateStatus(@PathVariable Long id, @RequestParam SimStatus status) {
        return ResponseEntity.ok(simCardService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSim(@PathVariable Long id) {
        simCardService.deleteSimCard(id);
        return ResponseEntity.noContent().build();
    }
}

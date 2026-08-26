package com.simportal.service;

import com.simportal.entity.SimCard;
import com.simportal.entity.SimCard.SimStatus;
import com.simportal.repository.SimCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SimCardService {

    private final SimCardRepository simCardRepository;

    public List<SimCard> getAllSimCards() {
        return simCardRepository.findAll();
    }

    public SimCard getSimCardById(Long id) {
        return simCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SIM Card not found with id: " + id));
    }

    public SimCard createSimCard(SimCard simCard) {
        if (simCardRepository.existsByAadhaarNumber(simCard.getAadhaarNumber())) {
            throw new RuntimeException("Aadhaar Number already exists: " + simCard.getAadhaarNumber());
        }
        if (simCardRepository.existsByMsisdn(simCard.getMsisdn())) {
            throw new RuntimeException("MSISDN already exists: " + simCard.getMsisdn());
        }
        return simCardRepository.save(simCard);
    }

    public List<SimCard> getAvailableSimCards() {
        return simCardRepository.findByStatus(SimStatus.AVAILABLE);
    }

    public SimCard updateStatus(Long id, SimStatus status) {
        SimCard sim = getSimCardById(id);
        sim.setStatus(status);
        return simCardRepository.save(sim);
    }

    public void deleteSimCard(Long id) {
        simCardRepository.deleteById(id);
    }

    public long countByStatus(SimStatus status) {
        return simCardRepository.countByStatus(status);
    }

    public long getTotalCount() {
        return simCardRepository.count();
    }
}

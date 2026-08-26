package com.simportal.service;

import com.simportal.entity.Activation;
import com.simportal.entity.Customer;
import com.simportal.entity.SimCard;
import com.simportal.entity.SimCard.SimStatus;
import com.simportal.repository.ActivationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivationService {

    private final ActivationRepository activationRepository;
    private final SimCardService simCardService;
    private final com.simportal.repository.SimCardRepository simCardRepository;
    private final CustomerService customerService;
    private final com.simportal.repository.CustomerRepository customerRepository;

    public List<Activation> getAllActivations() {
        return activationRepository.findAll();
    }

    public Activation getActivationById(Long id) {
        return activationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activation not found with id: " + id));
    }

    @Transactional
    public Activation activateSim(Long simCardId, Long customerId, String plan) {
        SimCard simCard = simCardService.getSimCardById(simCardId);
        Customer customer = customerService.getCustomerById(customerId);

        if (simCard.getStatus() != SimStatus.AVAILABLE) {
            throw new RuntimeException("SIM Card is not available for activation. Current status: " + simCard.getStatus());
        }

        // Mark SIM as activated
        simCardService.updateStatus(simCardId, SimStatus.ACTIVATED);

        Activation activation = Activation.builder()
                .simCard(simCard)
                .customer(customer)
                .plan(plan)
                .status(Activation.ActivationStatus.ACTIVE)
                .build();

        return activationRepository.save(activation);
    }

    @Transactional
    public Activation publicActivate(String msisdn, String network, String plan) {
        // Find or create sim card
        SimCard simCard = simCardRepository.findByMsisdn(msisdn).orElseGet(() -> {
            SimCard newSim = SimCard.builder()
                    .aadhaarNumber("1234" + (System.currentTimeMillis() % 100000000L))
                    .msisdn(msisdn)
                    .network(network)
                    .status(SimStatus.AVAILABLE)
                    .build();
            return simCardRepository.save(newSim);
        });

        if (simCard.getStatus() != SimStatus.AVAILABLE && simCard.getStatus() != SimStatus.ACTIVATED) {
             throw new RuntimeException("SIM Card is deactivated.");
        }

        simCard.setStatus(SimStatus.ACTIVATED);
        simCard = simCardRepository.save(simCard);

        // Find or create a default customer
        Customer customer = customerRepository.findByPhone(msisdn).orElseGet(() -> {
            Customer newCust = Customer.builder()
                    .name("Public User")
                    .email("user" + System.currentTimeMillis() + "@example.com")
                    .phone(msisdn)
                    .idNumber("ID" + System.currentTimeMillis())
                    .address("Online Activation")
                    .simType(network)
                    .build();
            return customerRepository.save(newCust);
        });

        Activation activation = Activation.builder()
                .simCard(simCard)
                .customer(customer)
                .plan(plan)
                .status(Activation.ActivationStatus.ACTIVE)
                .build();

        return activationRepository.save(activation);
    }

    public List<Activation> getActivationsByCustomer(Long customerId) {
        return activationRepository.findByCustomerId(customerId);
    }

    public long getTotalCount() {
        return activationRepository.count();
    }
}

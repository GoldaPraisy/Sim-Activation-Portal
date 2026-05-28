package com.simportal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sim_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "aadhaar_number", nullable = false, unique = true, length = 12)
    private String aadhaarNumber;

    @Column(nullable = false, unique = true, length = 15)
    private String msisdn;

    @Column(nullable = false)
    private String network;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SimStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = SimStatus.AVAILABLE;
    }

    public enum SimStatus {
        AVAILABLE, ACTIVATED, DEACTIVATED
    }
}

package com.simportal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sim_card_id", nullable = false)
    private SimCard simCard;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private String plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivationStatus status;

    @Column(name = "activation_date")
    private LocalDateTime activationDate;

    @PrePersist
    protected void onCreate() {
        activationDate = LocalDateTime.now();
        if (status == null) status = ActivationStatus.ACTIVE;
    }

    public enum ActivationStatus {
        ACTIVE, SUSPENDED, CANCELLED
    }
}

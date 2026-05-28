package com.simportal.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "network_name", nullable = false)
    private String networkName;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private String benefits;

    @Column(nullable = false)
    private String validity;
}

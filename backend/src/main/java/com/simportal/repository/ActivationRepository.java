package com.simportal.repository;

import com.simportal.entity.Activation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivationRepository extends JpaRepository<Activation, Long> {
    List<Activation> findByCustomerId(Long customerId);
    List<Activation> findBySimCardId(Long simCardId);
    boolean existsBySimCardId(Long simCardId);
}

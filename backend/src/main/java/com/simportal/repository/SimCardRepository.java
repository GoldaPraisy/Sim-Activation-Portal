package com.simportal.repository;

import com.simportal.entity.SimCard;
import com.simportal.entity.SimCard.SimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SimCardRepository extends JpaRepository<SimCard, Long> {
    Optional<SimCard> findByAadhaarNumber(String aadhaarNumber);
    Optional<SimCard> findByMsisdn(String msisdn);
    List<SimCard> findByStatus(SimStatus status);
    long countByStatus(SimStatus status);
    boolean existsByAadhaarNumber(String aadhaarNumber);
    boolean existsByMsisdn(String msisdn);
}

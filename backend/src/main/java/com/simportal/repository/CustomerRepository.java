package com.simportal.repository;

import com.simportal.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByIdNumber(String idNumber);
    Optional<Customer> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByIdNumber(String idNumber);
}

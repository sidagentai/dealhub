package com.dealhub.redirect;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RetailerLinkPolicyRepository extends JpaRepository<RetailerLinkPolicy, Long> {

    Optional<RetailerLinkPolicy> findByRetailerNameIgnoreCase(String retailerName);
}

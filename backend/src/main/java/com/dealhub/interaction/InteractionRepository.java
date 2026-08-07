package com.dealhub.interaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InteractionRepository extends JpaRepository<Interaction, Long> {

    Optional<Interaction> findByUserIdAndDealIdAndType(Long userId, Long dealId, String type);
}

package com.dealhub.interaction;

import com.dealhub.common.ApiException;
import com.dealhub.deal.DealRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SaveController {

    private final InteractionRepository interactions;
    private final DealRepository deals;

    public SaveController(InteractionRepository interactions, DealRepository deals) {
        this.interactions = interactions;
        this.deals = deals;
    }

    @PostMapping("/deals/{id}/save")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Void> save(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        if (!deals.existsById(id)) {
            throw ApiException.notFound("deal not found");
        }
        if (interactions.findByUserIdAndDealIdAndType(userId, id, Interaction.TYPE_SAVE).isEmpty()) {
            interactions.save(new Interaction(userId, id, Interaction.TYPE_SAVE));
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/deals/{id}/save")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Void> unsave(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        interactions.findByUserIdAndDealIdAndType(userId, id, Interaction.TYPE_SAVE)
                .ifPresent(interactions::delete);
        return ResponseEntity.noContent().build();
    }
}

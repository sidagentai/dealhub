package com.dealhub.redirect;

import com.dealhub.common.ApiException;
import com.dealhub.deal.Deal;
import com.dealhub.deal.DealRepository;
import com.dealhub.interaction.Interaction;
import com.dealhub.interaction.InteractionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

/**
 * The click-through endpoint. Every affiliate link in the app points here,
 * never directly at the retailer — this is what makes click data complete
 * enough to support any monetization model later.
 */
@RestController
public class RedirectController {

    private final DealRepository deals;
    private final InteractionRepository interactions;
    private final RetailerLinkPolicyRepository policies;

    public RedirectController(DealRepository deals, InteractionRepository interactions,
                              RetailerLinkPolicyRepository policies) {
        this.deals = deals;
        this.interactions = interactions;
        this.policies = policies;
    }

    @GetMapping("/d/{dealId}")
    @Transactional
    public ResponseEntity<Void> clickThrough(@AuthenticationPrincipal Long userId,
                                             @PathVariable Long dealId) {
        Deal deal = deals.findById(dealId)
                .orElseThrow(() -> ApiException.notFound("deal not found"));

        // userId is null for anonymous visitors — the click is logged either way
        interactions.save(new Interaction(userId, dealId, Interaction.TYPE_CLICK));

        String target = policies.findByRetailerNameIgnoreCase(deal.getRetailer())
                .filter(p -> RetailerLinkPolicy.POLICY_DIRECT_WITH_PARAM.equals(p.getPolicy()))
                .map(p -> withTrackingParam(deal.getAffiliateUrl(), p.getParamTemplate(), dealId))
                .orElse(deal.getAffiliateUrl());

        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
    }

    /**
     * For retailers whose affiliate terms prohibit plain redirects, append their
     * tracking parameter (template may reference {deal_id}) instead.
     */
    private static String withTrackingParam(String url, String template, Long dealId) {
        if (template == null || template.isBlank()) {
            return url;
        }
        String param = template.replace("{deal_id}", String.valueOf(dealId));
        return url + (url.contains("?") ? "&" : "?") + param;
    }
}

package com.dealhub.deal;

import com.dealhub.category.Category;
import com.dealhub.category.CategoryRepository;
import com.dealhub.common.ApiException;
import com.dealhub.deal.DealDtos.CreateDealRequest;
import com.dealhub.deal.DealDtos.DealDetailResponse;
import com.dealhub.deal.DealDtos.DealResponse;
import com.dealhub.deal.DealDtos.PricePoint;
import com.dealhub.user.User;
import com.dealhub.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
public class DealController {

    private final DealRepository deals;
    private final CategoryRepository categories;
    private final UserRepository users;
    private final PriceHistoryRepository priceHistory;

    public DealController(DealRepository deals, CategoryRepository categories,
                          UserRepository users, PriceHistoryRepository priceHistory) {
        this.deals = deals;
        this.categories = categories;
        this.users = users;
        this.priceHistory = priceHistory;
    }

    @PostMapping("/deals")
    @PreAuthorize("hasRole('POSTER')")
    @Transactional
    public ResponseEntity<DealResponse> create(@AuthenticationPrincipal Long userId,
                                               @Valid @RequestBody CreateDealRequest req) {
        User poster = users.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("unknown user"));
        Category category = categories.findById(req.categoryId())
                .orElseThrow(() -> ApiException.badRequest("unknown category"));
        Deal deal = deals.save(new Deal(poster, req.title(), req.description(), category,
                req.price(), req.originalPrice(), req.imageUrl(),
                req.retailer(), req.affiliateUrl(), req.expiresAt()));
        return ResponseEntity.status(HttpStatus.CREATED).body(DealResponse.of(deal));
    }

    @GetMapping("/deals/{id}")
    @Transactional(readOnly = true)
    public DealDetailResponse detail(@PathVariable Long id) {
        Deal deal = deals.findById(id)
                .orElseThrow(() -> ApiException.notFound("deal not found"));
        var history = priceHistory.findByDealIdOrderByRecordedAtAsc(id).stream()
                .map(p -> new PricePoint(p.getPrice(), p.getRecordedAt()))
                .toList();
        return new DealDetailResponse(DealResponse.of(deal), history);
    }
}

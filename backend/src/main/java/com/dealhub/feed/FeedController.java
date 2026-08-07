package com.dealhub.feed;

import com.dealhub.common.ApiException;
import com.dealhub.feed.DealQueryService.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
public class FeedController {

    private static final int MAX_PAGE_SIZE = 50;

    private final DealQueryService dealQueries;

    public FeedController(DealQueryService dealQueries) {
        this.dealQueries = dealQueries;
    }

    @GetMapping("/feed")
    public Page feed(@AuthenticationPrincipal Long userId,
                     @RequestParam(defaultValue = "trending") String mode,
                     @RequestParam(required = false) Long category,
                     @RequestParam(defaultValue = "0") int page,
                     @RequestParam(defaultValue = "20") int size) {
        size = clamp(size);
        if ("following".equals(mode)) {
            if (userId == null) {
                throw ApiException.unauthorized("login required for the following feed");
            }
            return dealQueries.followingFeed(userId, category, page, size);
        }
        return dealQueries.trendingFeed(category, page, size);
    }

    @GetMapping("/search")
    public Page search(@RequestParam(required = false) String q,
                       @RequestParam(required = false) Long category,
                       @RequestParam(name = "min_price", required = false) BigDecimal minPrice,
                       @RequestParam(name = "max_price", required = false) BigDecimal maxPrice,
                       @RequestParam(defaultValue = "relevance") String sort,
                       @RequestParam(defaultValue = "0") int page,
                       @RequestParam(defaultValue = "20") int size) {
        return dealQueries.search(q, category, minPrice, maxPrice, sort, page, clamp(size));
    }

    @GetMapping("/users/{id}/deals")
    public Page dealsByPoster(@PathVariable Long id,
                              @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "20") int size) {
        return dealQueries.byPoster(id, page, clamp(size));
    }

    private static int clamp(int size) {
        return Math.max(1, Math.min(size, MAX_PAGE_SIZE));
    }
}

package com.dealhub.stats;

import com.dealhub.common.ApiException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Poster analytics over the interactions log. Totals come from the raw log
 * (not the denormalized counters) so time-windowed breakdowns can be added
 * later without changing the data source.
 */
@RestController
public class StatsController {

    private final JdbcClient jdbc;

    public StatsController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public record DealStats(Long dealId, String title, int clicks, int saves, int shares) {
    }

    public record StatsResponse(long totalClicks, long totalSaves, long totalShares,
                                long clicksLast7Days, int dealCount, List<DealStats> topDeals) {
    }

    @GetMapping("/users/{id}/stats")
    @PreAuthorize("isAuthenticated()")
    public StatsResponse stats(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        if (!userId.equals(id)) {
            throw ApiException.forbidden("stats are visible to the poster only");
        }

        var totals = jdbc.sql("""
                SELECT count(*) FILTER (WHERE i.type = 'click') AS clicks,
                       count(*) FILTER (WHERE i.type = 'save')  AS saves,
                       count(*) FILTER (WHERE i.type = 'share') AS shares,
                       count(*) FILTER (WHERE i.type = 'click'
                                        AND i.created_at > now() - interval '7 days') AS clicks_7d,
                       count(DISTINCT d.id) AS deal_count
                FROM deals d
                LEFT JOIN interactions i ON i.deal_id = d.id
                WHERE d.poster_id = :id
                """)
                .param("id", id)
                .query((rs, n) -> new long[]{rs.getLong("clicks"), rs.getLong("saves"),
                        rs.getLong("shares"), rs.getLong("clicks_7d"), rs.getLong("deal_count")})
                .single();

        List<DealStats> topDeals = jdbc.sql("""
                SELECT d.id, d.title, d.click_count, d.save_count,
                       (SELECT count(*) FROM interactions i
                        WHERE i.deal_id = d.id AND i.type = 'share') AS share_count
                FROM deals d
                WHERE d.poster_id = :id
                ORDER BY d.click_count DESC, d.save_count DESC
                LIMIT 10
                """)
                .param("id", id)
                .query((rs, n) -> new DealStats(rs.getLong("id"), rs.getString("title"),
                        rs.getInt("click_count"), rs.getInt("save_count"), rs.getInt("share_count")))
                .list();

        return new StatsResponse(totals[0], totals[1], totals[2], totals[3],
                (int) totals[4], topDeals);
    }
}

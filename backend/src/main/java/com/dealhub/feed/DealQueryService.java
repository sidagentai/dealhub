package com.dealhub.feed;

import com.dealhub.deal.DealDtos.DealResponse;
import com.dealhub.user.UserDtos.UserSummary;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Read-side queries for deal listings (feed, search, profile grids).
 * Single SQL join per request — no entity graph / N+1 concerns on the hot read paths.
 */
@Service
public class DealQueryService {

    /**
     * Trending score: engagement (saves weighted over clicks) divided by an
     * age penalty, so fresh-and-engaging beats old-and-popular.
     * (clicks + 3*saves + 1) / (hours_since_post + 2)^1.5
     */
    static final String TRENDING_SCORE =
            "(d.click_count + 3 * d.save_count + 1) / " +
            "power(EXTRACT(EPOCH FROM (now() - d.posted_at)) / 3600.0 + 2, 1.5)";

    private static final String BASE_SELECT = """
            SELECT d.id, d.title, d.description, d.category_id, c.name AS category_name,
                   d.price, d.original_price, d.image_url, d.retailer,
                   d.posted_at, d.expires_at, d.click_count, d.save_count,
                   u.id AS poster_id, u.handle, u.display_name, u.avatar_url,
                   u.is_poster, u.follower_count
            FROM deals d
            JOIN users u ON u.id = d.poster_id
            JOIN categories c ON c.id = d.category_id
            WHERE (d.expires_at IS NULL OR d.expires_at > now())
            """;

    private static final RowMapper<DealResponse> ROW_MAPPER = (ResultSet rs, int rowNum) -> new DealResponse(
            rs.getLong("id"),
            rs.getString("title"),
            rs.getString("description"),
            rs.getLong("category_id"),
            rs.getString("category_name"),
            rs.getBigDecimal("price"),
            rs.getBigDecimal("original_price"),
            rs.getString("image_url"),
            rs.getString("retailer"),
            instant(rs, "posted_at"),
            instant(rs, "expires_at"),
            rs.getInt("click_count"),
            rs.getInt("save_count"),
            new UserSummary(
                    rs.getLong("poster_id"),
                    rs.getString("handle"),
                    rs.getString("display_name"),
                    rs.getString("avatar_url"),
                    rs.getBoolean("is_poster"),
                    rs.getInt("follower_count")));

    private static Instant instant(ResultSet rs, String column) throws SQLException {
        var ts = rs.getTimestamp(column);
        return ts == null ? null : ts.toInstant();
    }

    public record Page(List<DealResponse> items, int page, boolean hasMore) {
    }

    private final JdbcClient jdbc;

    public DealQueryService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public Page followingFeed(long userId, Long categoryId, int page, int size) {
        String sql = BASE_SELECT
                + " AND d.poster_id IN (SELECT following_id FROM follows WHERE follower_id = :uid)"
                + categoryClause(categoryId)
                + " ORDER BY d.posted_at DESC LIMIT :limit OFFSET :offset";
        return run(sql, pageParams(Map.of("uid", userId), categoryId, page, size), page, size);
    }

    public Page trendingFeed(Long categoryId, int page, int size) {
        String sql = BASE_SELECT
                + categoryClause(categoryId)
                + " ORDER BY " + TRENDING_SCORE + " DESC, d.posted_at DESC LIMIT :limit OFFSET :offset";
        return run(sql, pageParams(Map.of(), categoryId, page, size), page, size);
    }

    public Page search(String query, Long categoryId, java.math.BigDecimal minPrice,
                       java.math.BigDecimal maxPrice, String sort, int page, int size) {
        Map<String, Object> params = new HashMap<>();
        StringBuilder sql = new StringBuilder(BASE_SELECT);

        boolean hasQuery = query != null && !query.isBlank();
        if (hasQuery) {
            sql.append(" AND d.search_vector @@ websearch_to_tsquery('english', :q)");
            params.put("q", query);
        }
        sql.append(categoryClause(categoryId));
        if (minPrice != null) {
            sql.append(" AND d.price >= :minPrice");
            params.put("minPrice", minPrice);
        }
        if (maxPrice != null) {
            sql.append(" AND d.price <= :maxPrice");
            params.put("maxPrice", maxPrice);
        }

        sql.append(switch (sort == null ? "relevance" : sort) {
            case "newest" -> " ORDER BY d.posted_at DESC";
            case "price_asc" -> " ORDER BY d.price ASC NULLS LAST, d.posted_at DESC";
            case "price_desc" -> " ORDER BY d.price DESC NULLS LAST, d.posted_at DESC";
            default -> hasQuery
                    ? " ORDER BY ts_rank(d.search_vector, websearch_to_tsquery('english', :q)) DESC, d.posted_at DESC"
                    : " ORDER BY d.posted_at DESC";
        });
        sql.append(" LIMIT :limit OFFSET :offset");
        return run(sql.toString(), pageParams(params, categoryId, page, size), page, size);
    }

    public Page byPoster(long posterId, int page, int size) {
        String sql = """
                SELECT d.id, d.title, d.description, d.category_id, c.name AS category_name,
                       d.price, d.original_price, d.image_url, d.retailer,
                       d.posted_at, d.expires_at, d.click_count, d.save_count,
                       u.id AS poster_id, u.handle, u.display_name, u.avatar_url,
                       u.is_poster, u.follower_count
                FROM deals d
                JOIN users u ON u.id = d.poster_id
                JOIN categories c ON c.id = d.category_id
                WHERE d.poster_id = :posterId
                ORDER BY d.posted_at DESC LIMIT :limit OFFSET :offset
                """;
        return run(sql, pageParams(Map.of("posterId", posterId), null, page, size), page, size);
    }

    /** Matches the category itself or any of its direct subcategories. */
    private static String categoryClause(Long categoryId) {
        return categoryId == null ? ""
                : " AND d.category_id IN (SELECT id FROM categories WHERE id = :categoryId" +
                  " OR parent_category_id = :categoryId)";
    }

    private static Map<String, Object> pageParams(Map<String, Object> base, Long categoryId, int page, int size) {
        Map<String, Object> params = new HashMap<>(base);
        if (categoryId != null) {
            params.put("categoryId", categoryId);
        }
        params.put("limit", size + 1); // fetch one extra row to compute hasMore
        params.put("offset", (long) page * size);
        return params;
    }

    private Page run(String sql, Map<String, Object> params, int page, int size) {
        List<DealResponse> rows = jdbc.sql(sql).params(params).query(ROW_MAPPER).list();
        boolean hasMore = rows.size() > size;
        return new Page(hasMore ? rows.subList(0, size) : rows, page, hasMore);
    }
}

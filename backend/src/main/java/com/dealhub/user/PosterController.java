package com.dealhub.user;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Poster discovery: the "who to follow" directory. */
@RestController
public class PosterController {

    private final JdbcClient jdbc;

    public PosterController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public record PosterCard(Long id, String handle, String displayName, String bio,
                             String avatarUrl, int followerCount, int dealCount,
                             boolean isFollowing) {
    }

    @GetMapping("/posters")
    public List<PosterCard> posters(@AuthenticationPrincipal Long userId,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "24") int size) {
        return jdbc.sql("""
                SELECT u.id, u.handle, u.display_name, u.bio, u.avatar_url, u.follower_count,
                       (SELECT count(*) FROM deals d WHERE d.poster_id = u.id) AS deal_count,
                       CASE WHEN CAST(:me AS BIGINT) IS NULL THEN FALSE ELSE EXISTS(
                           SELECT 1 FROM follows f
                           WHERE f.follower_id = CAST(:me AS BIGINT) AND f.following_id = u.id
                       ) END AS is_following
                FROM users u
                WHERE u.is_poster
                ORDER BY u.follower_count DESC, deal_count DESC, u.id
                LIMIT :limit OFFSET :offset
                """)
                .param("me", userId)
                .param("limit", Math.max(1, Math.min(size, 50)))
                .param("offset", (long) Math.max(0, page) * size)
                .query((rs, n) -> new PosterCard(
                        rs.getLong("id"), rs.getString("handle"),
                        rs.getString("display_name"), rs.getString("bio"),
                        rs.getString("avatar_url"), rs.getInt("follower_count"),
                        rs.getInt("deal_count"), rs.getBoolean("is_following")))
                .list();
    }
}

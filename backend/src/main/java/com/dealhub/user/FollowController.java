package com.dealhub.user;

import com.dealhub.common.ApiException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FollowController {

    private final FollowRepository follows;
    private final UserRepository users;

    public FollowController(FollowRepository follows, UserRepository users) {
        this.follows = follows;
        this.users = users;
    }

    @PostMapping("/users/{id}/follow")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Void> follow(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        if (userId.equals(id)) {
            throw ApiException.badRequest("cannot follow yourself");
        }
        if (!users.existsById(id)) {
            throw ApiException.notFound("user not found");
        }
        if (!follows.existsById(new Follow.FollowId(userId, id))) {
            follows.save(new Follow(userId, id));
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{id}/follow")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Void> unfollow(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        follows.findById(new Follow.FollowId(userId, id)).ifPresent(follows::delete);
        return ResponseEntity.noContent().build();
    }
}

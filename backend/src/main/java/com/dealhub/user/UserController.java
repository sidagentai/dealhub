package com.dealhub.user;

import com.dealhub.common.ApiException;
import com.dealhub.user.UserDtos.UserProfile;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    private final UserRepository users;

    public UserController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/users/{id}")
    public UserProfile profile(@PathVariable Long id) {
        return users.findById(id)
                .map(UserProfile::of)
                .orElseThrow(() -> ApiException.notFound("user not found"));
    }

    public record UpdateProfileRequest(
            @Size(min = 1, max = 80) String displayName,
            @Size(max = 500) String bio,
            @URL @Size(max = 1000) String avatarUrl) {
    }

    /** Partial update: only non-null fields are applied. */
    @PatchMapping("/users/me")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public UserProfile updateMe(@AuthenticationPrincipal Long userId,
                                @Valid @RequestBody UpdateProfileRequest req) {
        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("unknown user"));
        if (req.displayName() != null) user.setDisplayName(req.displayName());
        if (req.bio() != null) user.setBio(req.bio());
        if (req.avatarUrl() != null) user.setAvatarUrl(req.avatarUrl());
        return UserProfile.of(users.save(user));
    }
}

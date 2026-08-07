package com.dealhub.user;

public final class UserDtos {

    private UserDtos() {
    }

    public record UserSummary(Long id, String handle, String displayName, String avatarUrl,
                              boolean isPoster, int followerCount) {

        public static UserSummary of(User u) {
            return new UserSummary(u.getId(), u.getHandle(), u.getDisplayName(),
                    u.getAvatarUrl(), u.isPoster(), u.getFollowerCount());
        }
    }

    public record UserProfile(Long id, String handle, String displayName, String bio,
                              String avatarUrl, boolean isPoster, int followerCount) {

        public static UserProfile of(User u) {
            return new UserProfile(u.getId(), u.getHandle(), u.getDisplayName(), u.getBio(),
                    u.getAvatarUrl(), u.isPoster(), u.getFollowerCount());
        }
    }
}

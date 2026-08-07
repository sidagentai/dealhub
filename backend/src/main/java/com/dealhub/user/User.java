package com.dealhub.user;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String handle;

    @Column(nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "display_name", nullable = false, length = 80)
    private String displayName;

    @Column(length = 500)
    private String bio;

    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    @Column(name = "is_poster", nullable = false)
    private boolean poster;

    // maintained by DB trigger on follows
    @Column(name = "follower_count", nullable = false, insertable = false, updatable = false)
    private Integer followerCount;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    protected User() {
    }

    public User(String handle, String email, String passwordHash, String displayName, boolean poster) {
        this.handle = handle;
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.poster = poster;
    }

    public Long getId() { return id; }
    public String getHandle() { return handle; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public String getBio() { return bio; }
    public String getAvatarUrl() { return avatarUrl; }
    public boolean isPoster() { return poster; }
    public Integer getFollowerCount() { return followerCount == null ? 0 : followerCount; }
    public Instant getCreatedAt() { return createdAt; }

    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setBio(String bio) { this.bio = bio; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public void setPoster(boolean poster) { this.poster = poster; }
}

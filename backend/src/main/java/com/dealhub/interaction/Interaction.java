package com.dealhub.interaction;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "interactions")
public class Interaction {

    public static final String TYPE_CLICK = "click";
    public static final String TYPE_SAVE = "save";
    public static final String TYPE_SHARE = "share";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // nullable: anonymous clicks through /d/{deal_id} are still logged
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "deal_id", nullable = false)
    private Long dealId;

    @Column(nullable = false, length = 10)
    private String type;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    protected Interaction() {
    }

    public Interaction(Long userId, Long dealId, String type) {
        this.userId = userId;
        this.dealId = dealId;
        this.type = type;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getDealId() { return dealId; }
    public String getType() { return type; }
    public Instant getCreatedAt() { return createdAt; }
}

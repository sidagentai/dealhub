package com.dealhub.deal;

import com.dealhub.category.Category;
import com.dealhub.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "deals")
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "poster_id", nullable = false)
    private User poster;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(nullable = false, length = 100)
    private String retailer;

    @Column(name = "affiliate_url", nullable = false, length = 2000)
    private String affiliateUrl;

    @Column(name = "posted_at", nullable = false, updatable = false)
    private Instant postedAt = Instant.now();

    @Column(name = "expires_at")
    private Instant expiresAt;

    // maintained by DB trigger on interactions
    @Column(name = "click_count", nullable = false, insertable = false, updatable = false)
    private Integer clickCount;

    @Column(name = "save_count", nullable = false, insertable = false, updatable = false)
    private Integer saveCount;

    protected Deal() {
    }

    public Deal(User poster, String title, String description, Category category,
                BigDecimal price, BigDecimal originalPrice, String imageUrl,
                String retailer, String affiliateUrl, Instant expiresAt) {
        this.poster = poster;
        this.title = title;
        this.description = description;
        this.category = category;
        this.price = price;
        this.originalPrice = originalPrice;
        this.imageUrl = imageUrl;
        this.retailer = retailer;
        this.affiliateUrl = affiliateUrl;
        this.expiresAt = expiresAt;
    }

    public Long getId() { return id; }
    public User getPoster() { return poster; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Category getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getOriginalPrice() { return originalPrice; }
    public String getImageUrl() { return imageUrl; }
    public String getRetailer() { return retailer; }
    public String getAffiliateUrl() { return affiliateUrl; }
    public Instant getPostedAt() { return postedAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public Integer getClickCount() { return clickCount == null ? 0 : clickCount; }
    public Integer getSaveCount() { return saveCount == null ? 0 : saveCount; }

    public void setPrice(BigDecimal price) { this.price = price; }
}

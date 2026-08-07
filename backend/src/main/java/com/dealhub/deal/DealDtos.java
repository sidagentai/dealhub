package com.dealhub.deal;

import com.dealhub.user.UserDtos.UserSummary;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class DealDtos {

    private DealDtos() {
    }

    public record CreateDealRequest(
            @NotBlank @Size(max = 200) String title,
            @Size(max = 10000) String description,
            @NotNull Long categoryId,
            @PositiveOrZero BigDecimal price,
            @PositiveOrZero BigDecimal originalPrice,
            @URL @Size(max = 1000) String imageUrl,
            @NotBlank @Size(max = 100) String retailer,
            @NotBlank @URL @Size(max = 2000) String affiliateUrl,
            Instant expiresAt) {
    }

    public record DealResponse(
            Long id, String title, String description,
            Long categoryId, String categoryName,
            BigDecimal price, BigDecimal originalPrice,
            String imageUrl, String retailer,
            Instant postedAt, Instant expiresAt,
            int clickCount, int saveCount,
            UserSummary poster) {

        public static DealResponse of(Deal d) {
            return new DealResponse(d.getId(), d.getTitle(), d.getDescription(),
                    d.getCategory().getId(), d.getCategory().getName(),
                    d.getPrice(), d.getOriginalPrice(),
                    d.getImageUrl(), d.getRetailer(),
                    d.getPostedAt(), d.getExpiresAt(),
                    d.getClickCount(), d.getSaveCount(),
                    UserSummary.of(d.getPoster()));
        }
    }

    public record PricePoint(BigDecimal price, Instant recordedAt) {
    }

    public record DealDetailResponse(DealResponse deal, List<PricePoint> priceHistory) {
    }
}

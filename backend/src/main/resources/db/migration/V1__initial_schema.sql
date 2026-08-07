-- DealHub initial schema
-- Decisions encoded here:
--   * Denormalized counters (deals.click_count/save_count, users.follower_count)
--     are maintained by DB triggers so no application code path can cause drift.
--   * interactions.user_id is nullable: clicks on /d/{deal_id} must be logged
--     even for anonymous (logged-out) visitors.
--   * Full-text search uses a generated tsvector column + GIN index (no
--     external search engine until data volume requires it).
--   * price_history rows are written by trigger on deal insert / price update,
--     giving a complete price timeline per deal.
--   * retailer_link_policies lets specific retailers opt out of the redirect
--     flow (affiliate programs that prohibit link cloaking).

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    handle         VARCHAR(30)  NOT NULL,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(100) NOT NULL,
    display_name   VARCHAR(80)  NOT NULL,
    bio            VARCHAR(500),
    avatar_url     VARCHAR(1000),
    is_poster      BOOLEAN      NOT NULL DEFAULT FALSE,
    follower_count INTEGER      NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_users_handle ON users (lower(handle));
CREATE UNIQUE INDEX ux_users_email  ON users (lower(email));

-- ---------------------------------------------------------------------------
-- categories (self-referencing tree, one level of nesting expected at MVP)
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name               VARCHAR(80) NOT NULL,
    parent_category_id BIGINT REFERENCES categories (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ux_categories_name_parent
    ON categories (lower(name), COALESCE(parent_category_id, 0));

-- ---------------------------------------------------------------------------
-- deals
-- ---------------------------------------------------------------------------
CREATE TABLE deals (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    poster_id      BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    category_id    BIGINT       NOT NULL REFERENCES categories (id),
    price          NUMERIC(12, 2),
    original_price NUMERIC(12, 2),
    image_url      VARCHAR(1000),
    retailer       VARCHAR(100) NOT NULL,
    affiliate_url  VARCHAR(2000) NOT NULL,
    posted_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at     TIMESTAMPTZ,
    click_count    INTEGER      NOT NULL DEFAULT 0,
    save_count     INTEGER      NOT NULL DEFAULT 0,
    search_vector  TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(retailer, '')), 'C')
    ) STORED
);

CREATE INDEX ix_deals_poster    ON deals (poster_id, posted_at DESC);
CREATE INDEX ix_deals_category  ON deals (category_id, posted_at DESC);
CREATE INDEX ix_deals_posted_at ON deals (posted_at DESC);
CREATE INDEX ix_deals_search    ON deals USING GIN (search_vector);

-- ---------------------------------------------------------------------------
-- follows
-- ---------------------------------------------------------------------------
CREATE TABLE follows (
    follower_id  BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    following_id BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX ix_follows_following ON follows (following_id);

-- ---------------------------------------------------------------------------
-- interactions (append-only engagement log; the monetization foundation)
-- ---------------------------------------------------------------------------
CREATE TABLE interactions (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT REFERENCES users (id) ON DELETE SET NULL,
    deal_id    BIGINT      NOT NULL REFERENCES deals (id) ON DELETE CASCADE,
    type       VARCHAR(10) NOT NULL CHECK (type IN ('click', 'save', 'share')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_interactions_deal_type ON interactions (deal_id, type, created_at DESC);
CREATE INDEX ix_interactions_user      ON interactions (user_id) WHERE user_id IS NOT NULL;

-- a user can save a given deal at most once (clicks/shares are unlimited)
CREATE UNIQUE INDEX ux_interactions_save
    ON interactions (user_id, deal_id) WHERE type = 'save';

-- ---------------------------------------------------------------------------
-- price_history
-- ---------------------------------------------------------------------------
CREATE TABLE price_history (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    deal_id     BIGINT         NOT NULL REFERENCES deals (id) ON DELETE CASCADE,
    price       NUMERIC(12, 2) NOT NULL,
    recorded_at TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX ix_price_history_deal ON price_history (deal_id, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- retailer_link_policies
-- ---------------------------------------------------------------------------
CREATE TABLE retailer_link_policies (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    retailer_name  VARCHAR(100) NOT NULL,
    policy         VARCHAR(20)  NOT NULL DEFAULT 'redirect'
                   CHECK (policy IN ('redirect', 'direct_with_param')),
    param_template VARCHAR(500),
    notes          VARCHAR(1000)
);

CREATE UNIQUE INDEX ux_retailer_link_policies_name
    ON retailer_link_policies (lower(retailer_name));

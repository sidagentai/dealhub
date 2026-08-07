-- Triggers maintaining denormalized state.
-- Chosen over application-layer sync so consistency holds regardless of which
-- code path (or future service) writes the underlying rows.

-- ---------------------------------------------------------------------------
-- deals.click_count / save_count <- interactions
-- Saves can be removed (unsave deletes the row), so DELETE decrements.
-- Clicks/shares are append-only.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_interactions_counters() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'click' THEN
            UPDATE deals SET click_count = click_count + 1 WHERE id = NEW.deal_id;
        ELSIF NEW.type = 'save' THEN
            UPDATE deals SET save_count = save_count + 1 WHERE id = NEW.deal_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.type = 'save' THEN
            UPDATE deals SET save_count = greatest(save_count - 1, 0) WHERE id = OLD.deal_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interactions_counters
    AFTER INSERT OR DELETE ON interactions
    FOR EACH ROW EXECUTE FUNCTION trg_interactions_counters();

-- ---------------------------------------------------------------------------
-- users.follower_count <- follows
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_follows_counter() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET follower_count = greatest(follower_count - 1, 0) WHERE id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follows_counter
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION trg_follows_counter();

-- ---------------------------------------------------------------------------
-- price_history <- deals (initial price on insert, new row on price change)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_deals_price_history() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.price IS NOT NULL THEN
            INSERT INTO price_history (deal_id, price) VALUES (NEW.id, NEW.price);
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.price IS DISTINCT FROM OLD.price AND NEW.price IS NOT NULL THEN
            INSERT INTO price_history (deal_id, price) VALUES (NEW.id, NEW.price);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_price_history
    AFTER INSERT OR UPDATE OF price ON deals
    FOR EACH ROW EXECUTE FUNCTION trg_deals_price_history();

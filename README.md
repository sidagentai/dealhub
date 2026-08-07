# DealHub

A social deals platform that sits between X (social feed, following) and a deals aggregator. One user account type with two behaviors:

- **Posters** build a following and post daily deals (retail products, credit card offers, rewards promos) with affiliate links, and can track clicks/engagement on their posts.
- **Browsers** scroll a feed (following + trending) or search by category to find deals regardless of who posted them.

## Status

MVP-1 in progress — see the [project board / PR history](../../pulls) for build-in-progress work.

## Tech stack

- **Backend:** Java / Spring Boot, Postgres (full-text search via `tsvector` for MVP)
- **Frontend:** Next.js (React), deployed to Vercel
- **Auth:** JWT

## Architecture notes

- All affiliate links route through a `/d/{deal_id}` redirect endpoint, which logs a click `Interaction` before forwarding to the retailer. This is the monetization foundation — click-tracking is granular by design so the eventual monetization model (revenue share, flat affiliate, subscription) can be decided later without a schema change.
- Trending feed ranking uses a recency-decay + engagement score, computed from the `Interaction` log.
- `click_count` / `save_count` on `Deal` are denormalized counters kept in sync via a Postgres trigger on `Interaction` inserts.
- Per-retailer link-handling policy (`redirect` vs. `direct_with_param`) supports affiliate programs with cloaking/redirect restrictions.

## Local development

### Backend

Requires Java 21+ and PostgreSQL 17.

```bash
# one-time DB setup
psql -d postgres -c "CREATE ROLE dealhub LOGIN PASSWORD 'dealhub' CREATEDB;" \
                 -c "CREATE DATABASE dealhub OWNER dealhub;"

cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080` (health check at `/actuator/health`). Database connection is configurable via `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` env vars. Schema is managed by Flyway migrations in `backend/src/main/resources/db/migration/`.

## Monetization

Undecided at MVP stage by design — architecture doesn't assume a specific model. Click-tracking granularity is built to support revenue share, flat affiliate, or subscription later.

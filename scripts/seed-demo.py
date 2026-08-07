#!/usr/bin/env python3
"""
Seed DealHub with realistic demo content through the public API.

Idempotent: signup falls back to login for existing accounts, and re-posting
is skipped when a poster already has deals. Safe to run against any
environment (defaults to local dev).

Usage:
    python3 scripts/seed-demo.py [--api http://localhost:8080]
"""

import argparse
import json
import random
import sys
import urllib.error
import urllib.request

PASSWORD = "password123"  # demo accounts only

POSTERS = [
    {
        "handle": "gadgetgrace",
        "displayName": "Gadget Grace",
        "bio": "Ex-electronics buyer. I post when the price is actually historic, not just 'on sale'.",
        "avatar": "https://i.pravatar.cc/150?img=47",
        "deals": [
            ("Sony A80L 65\" OLED lowest price ever", "Was $1,899 at launch, now under half. Set price alerts confirmed this is the floor.", "TVs & Audio", 899.99, 1899.99, "BestBuy", "sony-oled"),
            ("AirPods Pro 2 (USB-C) back to $169", "Drops to this every few months — if you waited, this is the window.", "Phones & Accessories", 169.00, 249.00, "Amazon", "airpods-pro"),
            ("Anker 737 power bank 40% off", "The 24k mAh beast that charges laptops. Rarely discounted this deep.", "Phones & Accessories", 89.99, 149.99, "Amazon", "anker-bank"),
            ("Dell 27\" 4K monitor $279", "USB-C with 90W power delivery — one cable for a MacBook setup.", "Laptops & Computers", 279.99, 429.99, "Dell", "dell-monitor"),
        ],
    },
    {
        "handle": "creditcardguru",
        "displayName": "The Points Professor",
        "bio": "Credit card bonuses and bank offers, ranked by real value. I read the fine print so you don't have to.",
        "avatar": "https://i.pravatar.cc/150?img=12",
        "deals": [
            ("Amex Gold 90k points offer via referral", "Highest public-ish offer this year. 90k after $6k spend in 6 months.", "Travel Rewards Cards", None, None, "American Express", "amex-gold"),
            ("Citi $450 checking bonus, no direct deposit trick", "Straightforward: $30k for 60 days. Works alongside their savings bonus.", "Bank Bonuses", None, None, "Citi", "citi-bonus"),
            ("Chase Freedom Flex 5% categories now live", "Q3: gas stations + EV charging + select live entertainment. Activate now.", "Cash Back Cards", None, None, "Chase", "freedom-flex"),
        ],
    },
    {
        "handle": "homehacker",
        "displayName": "Home Hacker Hana",
        "bio": "Kitchen + smart home. Everything I post has survived my own house first.",
        "avatar": "https://i.pravatar.cc/150?img=32",
        "deals": [
            ("Lodge cast iron 3-pack for $49", "Skillet, griddle, dutch oven. This bundle usually runs $90+.", "Home & Kitchen", 49.99, 94.99, "Target", "lodge-castiron"),
            ("Roborock Q8 Max+ with auto-empty $399", "Self-emptying at the price others charge without the dock.", "Home & Kitchen", 399.99, 599.99, "Amazon", "roborock"),
            ("Philips Hue starter kit 4-pack lowest of the year", "Four color bulbs + bridge — cheaper than three bulbs alone usually.", "Home & Kitchen", 119.99, 199.99, "Amazon", "hue-kit"),
            ("Ninja CREAMi back in stock at $149", "Sells out every time it hits this price. Move fast.", "Home & Kitchen", 149.99, 229.99, "Walmart", "ninja-creami"),
        ],
    },
    {
        "handle": "travelsteals",
        "displayName": "Mileage Marco",
        "bio": "Flight deals and hotel steals. If it's not 40% under typical, I don't post it.",
        "avatar": "https://i.pravatar.cc/150?img=68",
        "deals": [
            ("SFO→Tokyo nonstop $580 roundtrip", "ZIPAIR + United mix, fall dates. Typical is $950+.", "Flights", 580.00, 950.00, "United", "sfo-tokyo"),
            ("Hyatt Place free-night certs stacking trick", "Book 4 nights on points, 5th free + cert. Works through March.", "Hotels", None, None, "Hyatt", "hyatt-certs"),
            ("NYC→Lisbon $412 on TAP, summer dates", "Yes, actual summer. Yes, checked bag included.", "Flights", 412.00, 780.00, "TAP Air Portugal", "nyc-lisbon"),
        ],
    },
    {
        "handle": "sneakersteve",
        "displayName": "Sneaker Steve",
        "bio": "Fashion drops and restocks without the resale markup. Mostly shoes, occasionally fits.",
        "avatar": "https://i.pravatar.cc/150?img=59",
        "deals": [
            ("New Balance 990v6 under retail at $155", "Made in USA line almost never dips. All sizes as of posting.", "Shoes", 155.00, 199.99, "New Balance", "nb-990"),
            ("Uniqlo U crew tees 3 for $30", "The best plain tee in the game, seasonal colors included.", "Men", 30.00, 44.85, "Uniqlo", "uniqlo-tees"),
            ("Nike Vomero 5 'Photon Dust' restock $109", "Was reselling at $180+. Sizes going fast.", "Shoes", 109.97, 160.00, "Nike", "vomero-5"),
        ],
    },
]

BROWSERS = [
    {"handle": "bargainben", "displayName": "Bargain Ben"},
    {"handle": "savvysara", "displayName": "Savvy Sara"},
]


def call(api, path, method="GET", body=None, token=None):
    req = urllib.request.Request(api + path, method=method)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    data = None
    if body is not None:
        req.add_header("Content-Type", "application/json")
        data = json.dumps(body).encode()
    try:
        with urllib.request.urlopen(req, data) as res:
            raw = res.read()
            return res.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        return e.code, None


def auth(api, handle, is_poster, display_name):
    status, body = call(api, "/auth/signup", "POST", {
        "handle": handle, "email": f"{handle}@demo.dealhub.example",
        "password": PASSWORD, "displayName": display_name, "isPoster": is_poster,
    })
    if status != 201:
        status, body = call(api, "/auth/login", "POST",
                            {"handleOrEmail": handle, "password": PASSWORD})
        if status != 200:
            sys.exit(f"cannot auth {handle} (status {status})")
    return body["token"], body["user"]["id"]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", default="http://localhost:8080")
    args = parser.parse_args()
    api = args.api.rstrip("/")
    rng = random.Random(42)  # deterministic engagement shape

    status, categories = call(api, "/categories")
    if status != 200:
        sys.exit(f"API not reachable at {api}")
    cat_ids = {}
    for c in categories:
        cat_ids[c["name"]] = c["id"]
        for s in c["subcategories"]:
            cat_ids[s["name"]] = s["id"]

    deal_ids = []
    poster_ids = []
    for poster in POSTERS:
        token, uid = auth(api, poster["handle"], True, poster["displayName"])
        poster_ids.append(uid)
        call(api, "/users/me", "PATCH",
             {"bio": poster["bio"], "avatarUrl": poster["avatar"]}, token)

        _, existing = call(api, f"/users/{uid}/deals")
        if existing and existing["items"]:
            print(f"{poster['handle']}: already has deals, skipping posts")
            deal_ids.extend(d["id"] for d in existing["items"])
            continue

        for (title, desc, cat, price, orig, retailer, slug) in poster["deals"]:
            body = {
                "title": title, "description": desc,
                "categoryId": cat_ids[cat], "retailer": retailer,
                "affiliateUrl": f"https://example.com/{slug}?aff={poster['handle']}",
                "imageUrl": f"https://picsum.photos/seed/{slug}/640/400",
            }
            if price is not None:
                body["price"] = price
                body["originalPrice"] = orig
            status, deal = call(api, "/deals", "POST", body, token)
            if status == 201:
                deal_ids.append(deal["id"])
        print(f"{poster['handle']}: seeded {len(poster['deals'])} deals")

    browser_tokens = []
    for browser in BROWSERS:
        token, _ = auth(api, browser["handle"], False, browser["displayName"])
        browser_tokens.append(token)

    # follows: each browser follows 3-4 posters; posters follow each other a bit
    for token in browser_tokens:
        for uid in rng.sample(poster_ids, k=min(4, len(poster_ids))):
            call(api, f"/users/{uid}/follow", "POST", None, token)

    # saves: browsers save a third of the deals
    for token in browser_tokens:
        for deal_id in rng.sample(deal_ids, k=max(1, len(deal_ids) // 3)):
            call(api, f"/deals/{deal_id}/save", "POST", None, token)

    # clicks: anonymous click-throughs, weighted so trending has shape
    total_clicks = 0
    for deal_id in deal_ids:
        for _ in range(rng.choice([0, 1, 2, 4, 7, 12, 20])):
            call(api, f"/d/{deal_id}")
            total_clicks += 1

    print(f"seeded: {len(poster_ids)} posters, {len(deal_ids)} deals, "
          f"{len(BROWSERS)} browsers, {total_clicks} clicks")


if __name__ == "__main__":
    main()

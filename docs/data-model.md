# Data model

## Tables

All tables carry Row Level Security. A user can only ever see their own
rows.

```
auth.users
 ├─ profiles            (id references auth.users, ON DELETE CASCADE)
 │   ├─ transactions    (user_id references profiles, CASCADE)
 │   └─ bets            (user_id references profiles, CASCADE)
 │       ├─ legs        (bet_id references bets, CASCADE)
 │       └─ bet_buys    (bet_id references bets, CASCADE)
 └─ connected_accounts  (user_id references auth.users, CASCADE)
```

**The cascade chain is complete.** Deleting the auth user removes every
row that person owns in one step, with nothing orphaned. That is why
account deletion needed no migration.

### bets

| Column | Notes |
|---|---|
| `stake` | numeric(12,2), > 0 |
| `total_odds` | numeric(10,2), > 1.00. Always derived, never typed. |
| `status` | `pending` / `won` / `lost` |
| `placed_at`, `settled_at` | timestamptz |
| `payout` | Exists on won bets AND on cashed-out bets, even losing ones. |
| `cashed_out` | boolean |

### legs

| Column | Notes |
|---|---|
| `sport` | **Holds a TOPIC, not only a sport.** See below. |
| `description` | The pick. Optional in the UI, falls back to category then topic. |
| `odds` | numeric(10,2) |
| `result` | `pending` / `won` / `lost` |
| `subcategory` | The canonical category. `null` means a manual bet whose user never picked one, which is a different fact from `Unclassified`. |
| `market` | The controlled market inside a category. |
| `period` | Full time, 1st Half, and so on. |
| `competition` | Premier League, MLB, ATP. |
| `provider_market` | The provider's own market name. The explainability trail. |

### transactions

`type` is `deposit` or `withdrawal` in the database. **The user never
sees those words.** The UI says Added and Removed, and design-check
fails the build on finance vocabulary in user-facing copy. Renaming the
columns would be a migration with no user-visible gain.

### connected_accounts

`platform`, `access_key`, `encrypted_secret`, `connected_at`,
`last_synced_at`. The Kalshi RSA private key is stored **AES-256-GCM
encrypted**, with the key in a Vercel setting and never in the
database, so a database leak alone does not leak Kalshi keys.

## Data stored outside tables

Some things live in the auth user's metadata, which is why they needed
no migration:

| Key | What |
|---|---|
| `full_name` | The name. The same field Google fills in, and the one the Track greeting reads. |
| `tracking_since` | The restart line. See business-rules. |
| `tracking_reset_tx` | The id of the balance transaction the restart created, so Undo can remove exactly that row and nothing else. |

Browser storage:

| Key | What |
|---|---|
| `actuals-theme` | System / Light / Dark, per device. `System` stores nothing. The old key was `celebet-theme`; both readers fall back to it once, copy across, and delete it. |

## The taxonomy

Locked 21 August 2026. Three rules:

1. **Categories are registered per domain.** No global category list.
2. **A provider mapper may only output registered values, or
   `Unclassified`.** It may never mint a new word.
3. **`Unclassified` is the only fallback.** A `null` category is a
   different fact: it means nobody was ever asked.

### The levels

| Level | Examples | Where it lives |
|---|---|---|
| **Domain** | Sports, Politics, Economics, Culture, Other | Derived at read time by `domainOf()`. Never stored. |
| **Topic** | Football, Tennis, Crypto, Weather | Stored in `legs.sport`. |
| **Category** | Moneyline, Player Props, Price Direction | `legs.subcategory` |
| **Market** | Match Winner, To Advance | `legs.market` |
| **Competition** | Premier League, MLB, ATP | `legs.competition` |
| **Period** | Full time, 1st Half | `legs.period` |

**Domain, topic, competition and period are independent dimensions, not
a ladder.** You can ask for BTTS across every league without walking
down from a domain first. That was the whole point of replacing the old
breadcrumb model.

### Topic is a name we had to invent

The level under a domain had no name, so it borrowed "sport". That is
how `SPORTS` ended up doing two jobs: naming the sports, and standing in
for "any valid value of `legs.sport`". When Crypto moved out of SPORTS,
three separate places silently started rejecting Crypto picks.

`TOPICS` and `isTopic()` in `src/lib/types.ts` now name that job.
`SPORTS` means sports and nothing else.

### The 24 topics, by domain

| Domain | Topics |
|---|---|
| Sports | Football, American Football, Basketball, Baseball, Ice Hockey, Tennis, Golf, esports, Cricket, MMA, Rugby, Motorsport, Boxing, Table Tennis |
| Politics | Politics, World |
| Economics | Economics, Companies, Crypto |
| Culture | Entertainment |
| Other | Weather, Tech & Science, Health, Other |

`legs_sport_check` in the database lists exactly these 24 words. Adding
a topic is a migration.

**Known weakness:** several topic names duplicate their own domain name
(Politics under Politics, Economics under Economics). Those words came
from Kalshi's categories, not from a deliberate choice. The owner has
seen this and chose to ship as-is and expand from real usage.

## Migrations

Every change is saved as `supabase/phaseN.sql`, in order, and every one
is written to be **safe to run twice**.

Run so far: `schema.sql`, then `phase2` through `phase13`, plus
`demo-account-rename.sql`. `phase8` was applied by Claude through the
Supabase connector; `phase12` and `phase13` were run by the owner and
both returned their proof numbers.

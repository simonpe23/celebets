---
description: The Actuals taxonomy, its levels, and the traps in them
paths:
  - "src/lib/taxonomy.ts"
  - "src/lib/types.ts"
  - "src/lib/kalshiSync.ts"
---

# Taxonomy rules

Full reference: `docs/data-model.md`.

## The three laws

1. **Categories are registered per domain.** No global category list.
2. **A provider mapper may only output registered values, or
   `Unclassified`.** It may never mint a new word.
3. **`Unclassified` is the only fallback.** A `null` category is a
   different fact: nobody was ever asked.

## The levels, and the names for them

| Level | Stored in |
|---|---|
| Domain (Sports, Politics, Economics, Culture, Other) | Nowhere. Derived by `domainOf()`. |
| **Topic** (Football, Crypto, Weather) | `legs.sport` |
| Category (Moneyline, Price Direction) | `legs.subcategory` |
| Market (Match Winner) | `legs.market` |
| Competition (Premier League) | `legs.competition` |
| Period (Full time, 1st Half) | `legs.period` |

**These are independent dimensions, not a ladder.** You can ask for BTTS
across every league without walking down from a domain.

## The trap that has bitten three times

**`SPORTS` means sports only.** It does NOT mean "any valid value of
`legs.sport`". Use `TOPICS` or `isTopic()` for that.

When Crypto moved out of `SPORTS`, three places silently started
rejecting Crypto picks: the breakdown table dropped them, the slip
parser refused them, and the insights filter ignored them. None of it
was visible in a screenshot.

**Before validating anything against `SPORTS`, ask whether you mean
sports or you mean topics.**

## Vocabulary changes

- **Competition is tapped, never typed.** `SPORT_COMPETITIONS` holds the
  owner's approved list per sport; `COMPETITION_ALIASES` pulls a
  provider's words onto the same chip. The reason is data integrity:
  "EPL" and "Premier League" typed by two people is one league split
  into two analytics rows forever.
- Adding a topic is a **database migration** (`legs_sport_check`).
- Adding a category or market is a **code change only**.

## Known gaps

- **Periods exist for Football only.** Every other sport has no half,
  quarter, set or innings, so those picks are indistinguishable.
- **Categories exist for Sports and Economics only.** Politics and
  Culture picks are honestly `Unclassified`.
- Several non-sport topic names duplicate their own domain name. Those
  words came from Kalshi, not from a deliberate choice.

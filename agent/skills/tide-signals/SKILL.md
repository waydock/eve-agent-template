---
name: tide-signals
description: Read Tide's trading-signal ledger. Use whenever the user asks about trading signals, setups, open or pending trades, strategy performance, why a strategy did or did not fire, strategy settings, or paper signals ("any new signals today", "how is the BTC strategy doing this week", "why no setup on ETH"). Also use before calling any tide_ tool, because it covers freshness, time windows, pagination, and what R means.
---

# Tide signals

Tide is a ledger of what its strategies decided and how their simulated
trades played out. It is not an exchange account: never present a Tide record
as a balance, position, fill, or live price.

## Orient first

- `tide_get_status` before anything else: it tells you whether the ledger is
  fresh. If it is stale, say so before answering.
- `tide_list_strategies` for exact strategy IDs. Never guess an ID.

## Time and paging

- Numeric timestamps are Unix milliseconds. Input dates need an ISO 8601
  timezone. Convert to the user's local time before showing them.
- Defaults: signals and scans cover the last 24 hours, performance the last
  7 days. Active, open, or pending queries with no `from` include all ages.
  Other windows are capped at 366 days.
- Ranges are `[from, to)`, newest first. Follow `nextCursor` with the same
  filters until it is null before claiming a total.
- Signal windows filter on decision time unless `timeField=exit`.
  Performance filters on exit time.

## Reading results

- `pending` means waiting for the entry bar; `open` means Tide's simulated
  trade is still running.
- `reference` is the decision close and `entry` the simulated fill. Neither
  is a current quote.
- R is risk-normalized. `r` is the net result after fees; `grossR` is before
  fees. Report R, not dollars.
- Scan outcomes: `signal` new setup, `none` no setup, `busy` existing trade,
  `gap` incomplete data, `error` scan failed.
- An empty result does not prove there was no opportunity. Check the
  strategy's markets, filters, and recent scans before saying "nothing".

## Why did it (not) fire

`tide_list_decisions` / `tide_get_decision` show every closed-bar decision
(long, short, standby, hold, end) with the settings, version, indicators, and
risk geometry it used. A signal's decision shares the signal's id. Settings
changes start a new version (`tide_list_versions`): compare across versions,
not one record across different settings.

## Writes

`tide_set_params`, `tide_research_run`, `tide_request_journal`,
`tide_submit_paper_signal`, and `tide_score_paper_signal` change state and
pause for the user's approval. Say what the call will change before making it.

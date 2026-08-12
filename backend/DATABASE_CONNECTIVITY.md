# Database Connectivity — Status & Troubleshooting

## Where the connection strings live

Both are in **`kitabwalah-api/.env`** (never committed — see `.gitignore`):

| Variable | Points to | Used by |
|---|---|---|
| `DATABASE_URL` | **newDev** (Kitabwalah) | `prisma/schema.prisma`'s `datasource db` block — this is the one Prisma Client, migrations, and the whole `kitabwalah-api` backend actually read. |
| `USEDBOOKS_DATABASE_URL` | **UsedBooks** | Not yet read by any code — reserved for the UsedBooks integration, which hasn't been built yet. |

## Current verified status (tested directly, just now)

Both connections **work**. Credentials are valid, SSL negotiates correctly, and `npx prisma db pull` successfully introspects the real schema on both. This is not a credentials problem.

**What's actually causing "can't connect":** Neon's free-tier compute **auto-suspends when idle** and has to "wake up" on the next connection. I ran the identical connectivity test twice:

| Attempt | Result | Time |
|---|---|---|
| 1st (compute already awake from a previous check) | Success | Fast |
| 2nd (after a period of no activity) | Success | **36.8 seconds** |

36 seconds is far longer than the timeout most tools use by default — a browser request, an API client, `psql`'s default connect timeout, even some ORMs, will all give up and report a connection failure well before Neon finishes waking up. That's almost certainly what you're hitting: **it's not broken, it's just asleep and slow to wake.**

### How to work around it

- **Just retry.** The second attempt after a "failed" one is normally fast, because the compute is now awake and stays awake for a while under continued activity.
- **If this is disruptive during development**, Neon's project dashboard has a compute/autoscaling setting to disable auto-suspend (or reduce the suspend timeout) — look under the project's **Settings → Compute**. This trades a small always-on cost for no cold-start delay.
- **If a specific tool's timeout is the real blocker** (e.g. a DB GUI client that gives up in 5–10s), check whether it has a configurable connection timeout and raise it to 45–60s for this project.
- This only affects the **first** request after idle time — everything after that is normal speed until it goes idle again.

## What's actually in each database (checked directly, row counts)

This matters for anyone connecting and expecting to see specific data:

**UsedBooks** (`USEDBOOKS_DATABASE_URL`) — looks like genuine, untouched production data. Row counts line up closely with what `usedbooks_schema.pdf` documents (155 users, all of them also vendors; 10 orders; 7 withdrawal requests; 5 cities). Querying a table from our own schema that UsedBooks was never supposed to have (`SiteTheme`) correctly errors — confirming nothing from this project's schema has ever touched this database.

**newDev** (`DATABASE_URL`) — has this project's complete Prisma schema already deployed on it (including a model added minutes before this was checked), but the actual row counts are small and round: 23 users, 24 products, 81 orders, 4 vendors. `kitabwalah_schema.pdf` documents the real newDev dataset as roughly 938 users / 4,986 products / 1,001 orders. These numbers look like the project's own `prisma/seed.ts` script was run against a freshly-migrated database, not like a real historical data migration.

**This is still an open question, not something I've resolved**: was this Neon project created fresh for this work (in which case the above is expected and fine), or did it hold different, real pre-existing data that a migration may have overwritten? If unsure, check that Neon project's branch/restore history now, before anything else runs against it.

## Quick self-check command

From `kitabwalah-api/`, this confirms connectivity without changing anything:

```bash
npx prisma db pull --print
```

Success looks like a full schema being printed to the terminal (may take up to ~40s if the compute was idle). A real credentials/network failure looks like `Error: P1000` (bad credentials) or `Error: P1001` (can't reach the server at all) — neither of which is what's happening here.

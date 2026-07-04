# AfriFX Academy — Project Brief

**What it is:** A full-stack Forex trading education platform combining online courses, live trading signals, a paper-trading simulator, and community features (meetings, leaderboards, certificates) for a brand called AfriFX Academy.

## Tech stack
- **Frontend:** React + Vite + TypeScript, React Router, custom CSS (green/gold dark theme), TradingView embed widgets for charts
- **Backend:** Express.js (Node), JWT auth (bcryptjs), Prisma 5 ORM
- **Database:** PostgreSQL (Neon, serverless, pooled connection)
- **Hosting:** Render (free tier, single web service serving both API + built React app)
- **Live price feed:** Yahoo Finance public chart endpoint (server-side, cached 5s) — not Binance (geo-blocked)

## Core features

1. **Courses** — modules, lessons (video embeds), quizzes, resources (files stored as DB bytea, not disk), completion tracking, certificates (PDF generated on-the-fly with QR verification, no disk storage)
2. **Trading Signals** — admin posts Forex/Gold/Crypto/Indices signals with entry/SL/multiple TPs; public performance-transparency page; **free to all logged-in users** (subscription paywall removed)
3. **Paper Trading Simulator** (`/trade`) — full MT5-style demo trading engine:
   - 8 instruments: EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, Gold, BTC/USD, ETH/USD
   - Market orders + all 4 pending order types (Buy/Sell Limit, Buy/Sell Stop) + Stop Limit
   - Lot-based sizing with real margin calculation (1:100), Stop Loss/Take Profit with pip/point/$ risk-reward calculator
   - Stop Level (min 10-pip distance) and Freeze Level (3-pip) broker-rule enforcement
   - Slippage simulation (adverse-only on stops/SL, exact on limits/TP)
   - **Margin Call / Stop Out** — auto-liquidates the worst-losing position when margin level drops below 50%
   - TradingView charts (locked to our 8 instruments, no free-form symbol search; selectable chart source/broker feed per instrument; light/dark toggle; enlarge/collapse without reloading the chart)
   - **Trading leaderboard** — ranks all traders by net realized P&L (Top Traders / Top Losers toggle); every closed trade is a **permanent record** — resetting your balance never deletes trade history
   - Explicitly **not implemented**: swap/rollover fees, commissions, chart drawing persistence (see Known Limitations below)
4. **Live Markets** page — public TradingView charts for the same instrument set
5. **Membership tiers** — Free / Premium / VVIP (payments are **mock/demo only**, no real charge)
6. **Meetings** — Google Calendar-integrated video sessions, host/attendee roles
7. **Gamification** — points, badges, streaks, separate leaderboard from trading
8. **Admin portal** — manage courses, students, signals, certificates, announcements, meetings, applications, analytics

## Accounts (demo)
- Admin: `admin@afrifx.com` / `admin123` (login at `/admin/login`)
- Student: `student@afrifx.com` / `student123`

## Deployment
- **Live:** https://afrifx-academy.onrender.com
- **Repo:** https://github.com/DaveOpps/afrifx-academy (branch `main`)
- Push to `main` auto-deploys via Render
- Full credentials in local `CREDENTIALS-local.txt` (gitignored, not in repo)
- `DEPLOY.md` has the original Render+Neon setup guide

## Known limitations
- **Free-tier hosting:** server cold-starts after 15 min idle (~30-50s wake); Neon DB also idles/wakes similarly
- **Chart drawing persistence:** the free TradingView embed widget (`embed-widget-advanced-chart.js`) destroys and recreates its iframe whenever the symbol changes, so any drawings/analysis made on the chart are lost the moment you switch instruments or reload — there is no save/load API exposed by this embed method for anonymous visitors. The only real fix is migrating to TradingView's **Advanced Charts Widget Constructor** library (a different integration: self-hosted JS library + our own backend to store/restore each user's drawings per instrument) — a genuine multi-day project, not started. Currently accepted as a known limitation.
- A **Vercel + Supabase migration was attempted and fully reverted** — Render + Neon is the current and only deployment target
- File uploads/certs intentionally avoid local disk (stored in Postgres) since Render's free tier has no persistent filesystem
- Payments across all membership/signal tiers are **mock only** — no real payment gateway integrated

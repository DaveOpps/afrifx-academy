# AfriFX Academy — User Manual

Your live site: **https://afrifx-academy.onrender.com**

> ⚠️ **First load is slow (~30–50 sec).** The free hosting plan "sleeps" the server
> after 15 minutes of no visitors. The next visitor wakes it up, which takes about
> 30–50 seconds. After that it's fast for everyone until it goes idle again. This is
> normal for free hosting.

---

## 1. Logins

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | `admin@afrifx.com` | `admin123` |
| 🎓 **Student** | `student@afrifx.com` | `student123` |

- **Students** sign in (or register a new account) at the normal **Login** page.
- **Admins** sign in at **`/admin/login`** (e.g. `https://afrifx-academy.onrender.com/admin/login`).

> 🔐 **Change the admin password** after your first login (see §6).

---

## 2. What the platform does

AfriFX Academy is a full Forex-education platform with two sides:

- **Student portal** — take courses, watch lessons, do quizzes, earn certificates,
  see trading signals, view live markets, join meetings, climb the leaderboard.
- **Admin portal** — manage everything: courses, students, signals, announcements,
  certificates, meetings, partnership applications, and analytics.

---

## 3. Student guide

### Getting started
1. **Register** a new account, or log in.
2. Browse **Courses** → open a course → click **Enroll**.
3. Open a lesson to start the **Lesson Viewer** (video + resources).

### Key student features
- **Courses & Lessons** — watch video lessons; progress is tracked automatically.
- **Quizzes** — at the end of modules; passing earns points.
- **Certificates** — once you complete a course, go to **Certificates** and click
  **Claim** / **Download PDF**. Each certificate has a QR code and a public
  verification link (`/verify/CODE`).
- **Markets** — live Forex/crypto prices and charts (powered by public market data).
- **Signals** — trade signals (entry, stop-loss, take-profit). Access depends on
  your membership tier (see below).
- **Performance** — public win-rate / pips track record from closed signals.
- **Leaderboard** — points & badges ranking (earned from lessons + quizzes).
- **Meetings** — scheduled live sessions (Google Meet links); join opens in a new tab.
- **Profile / My Account** — change password, view payment history & subscription.

### Membership tiers
- **Free** — courses + basic access.
- **Signal subscription** ($5/month) — unlocks trading signals.
- **VVIP** ($50 lifetime) — permanent signal access.
- **Premium** — extended access.

> 💳 **Payments are currently in DEMO/MOCK mode** — clicking "Upgrade" or "Subscribe"
> activates instantly **without charging anyone**. To take real money you'd need to
> connect a real payment gateway (Mobile Money / Stripe / PayPal) with your own keys.

---

## 4. Admin guide

Log in at **`/admin/login`**. The admin sidebar gives you:

### Courses (`/admin/courses`)
- **Create a course** → add a title, description, thumbnail, category.
- Inside a course, add **Modules** → inside modules add **Lessons** (video URL,
  duration) and **Quizzes**.
- Add **Resources** to lessons: upload a file (PDF, etc.) or paste a link.
  *(Uploaded files are stored safely in the database.)*

### Students (`/admin/students`)
- View all students, open a student to see their progress, enrollments, points.
- **Promote/demote** roles (student / instructor / admin).
- Reset a student's password if needed.

### Signals (`/admin/signals`)
- Post new trade signals (pair, direction, entry, SL, TP1–TP3).
- Mark signals as won/lost and record pips → feeds the public Performance page.

### Certificates (`/admin/certificates`)
- View all issued certificates.
- **Manually issue** a certificate to any student for any course.

### Announcements (`/admin/announcements`)
- Post announcements → students get a notification (bell icon) and an optional email.

### Meetings (`/admin/meetings`)
- Schedule live sessions. If Google Calendar is connected, Meet links are
  auto-generated; otherwise paste a link manually.

### Applications (`/admin/applications`)
- Review partnership/IB/seminar applications submitted from the public partner pages.

### Analytics (`/admin/analytics`)
- Dashboards: enrollments, completions, revenue (mock), active students, etc.

---

## 5. Adding & editing content (typical workflow)

1. Log in as admin → **Courses** → **New Course**.
2. Open the course → **Add Module** → **Add Lesson** (paste a YouTube embed URL
   like `https://www.youtube.com/embed/VIDEO_ID`).
3. Optionally add a **Quiz** to the module and **Resources** to the lesson.
4. Students can now enroll and learn. Done!

---

## 6. Important admin tasks

### Change the admin password
1. Log in as admin → go to **Profile** / **My Account**.
2. Use **Change Password**.
   *(Or create a brand-new admin account and remove the demo one.)*

### Reset the database password (Neon) — optional security step
Your database password was visible during setup. To rotate it:
1. Go to **https://console.neon.tech** → your **afrifx** project → **Connect**.
2. Click **Reset password** → copy the **new pooled connection string**.
3. In **Render** → **Environment** → update `DATABASE_URL` → **Save** (auto-redeploys).

---

## 7. Pushing future updates

Whenever you (or I) change the code on this computer:

```bash
cd "C:/Users/Admin/Desktop/solars babbershop/afrifx-academy"
git add .
git commit -m "describe your change"
git push
```

Render **auto-deploys** every push to the `main` branch — no extra steps. Wait a few
minutes and your live site updates automatically.

---

## 8. Running it locally (for development/testing)

The app uses your Neon Postgres database (the `server/.env` file already holds the
connection). To run on your own computer:

```bash
# Terminal 1 — backend API (http://localhost:5000)
cd "C:/Users/Admin/Desktop/solars babbershop/afrifx-academy/server"
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd "C:/Users/Admin/Desktop/solars babbershop/afrifx-academy/client"
npm run dev
```

Then open **http://localhost:5173**.

> ⚠️ Local dev shares the **same live database** as your deployed site. Be careful —
> changes you make locally affect the real data. (To avoid this, create a second free
> Neon project for testing and use its URL in `server/.env`.)

---

## 9. Free-tier limits (good to know)

| Thing | Limit | Notes |
|-------|-------|-------|
| Server sleep | After 15 min idle | First visit then takes ~30–50s to wake |
| Database | 0.5 GB (Neon free) | Plenty for a demo; uploads live here too |
| Database sleep | Auto-suspends when idle | Wakes automatically on first query |
| Build minutes | Generous free allowance | Each `git push` triggers a rebuild |

**Want no cold starts / always-on?** Upgrade the Render service to the **Starter**
plan ($7/month) — that removes the sleep delay and adds Shell access, persistent
disk, etc. (Not required — the free setup works fine for a demo/portfolio.)

---

## 10. Quick troubleshooting

| Problem | Fix |
|---------|-----|
| Site slow / spinning on first visit | Normal cold start — wait ~40 sec |
| "Can't reach database" after long idle | Refresh once; Neon is waking up |
| Login fails | Make sure DB was seeded; use exact demo credentials |
| Need to re-seed demo data | Run `npm run seed` in `server/` locally |
| Changes not showing on live site | Did you `git push`? Check Render → Events |

---

*Built with React + Express + Prisma + Postgres. Hosted free on Render + Neon.*

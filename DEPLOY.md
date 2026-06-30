# Deploying AfriFX Academy — Render + Neon (free)

The whole app runs as **one free Render web service**: Express serves both the API
and the built React app. The database is **Neon Postgres** (free). Uploaded files and
certificate PDFs are stored in / generated from the database, so **no disk is needed**.

---

## Step 1 — Create the database (Neon)

1. Go to https://neon.tech and sign up (free).
2. Create a new **Project** (any name, e.g. `afrifx`).
3. On the project dashboard, copy the **connection string** (use the *Pooled* one).
   It looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
   Keep this — it's your `DATABASE_URL`.

## Step 2 — Put the code on GitHub

From the project folder (`afrifx-academy`):

```bash
git init
git add .
git commit -m "AfriFX Academy — ready for Render + Neon"
```

Then create an empty repo on GitHub and push:

```bash
git remote add origin https://github.com/<you>/afrifx-academy.git
git branch -M main
git push -u origin main
```

## Step 3 — Create the Render service

1. Go to https://render.com and sign up (free). Connect your GitHub.
2. Click **New → Web Service** and pick the `afrifx-academy` repo.
   (Render will detect `render.yaml` — you can use it as a Blueprint, or set the
   fields manually as below.)
3. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | your Neon connection string from Step 1 |
   | `JWT_SECRET` | any long random string |
   | `PUBLIC_URL` | leave blank for now (set after first deploy) |
5. Click **Create Web Service**. The first build takes a few minutes
   (it installs deps, builds React, and runs `prisma db push` to create the tables).

## Step 4 — Set PUBLIC_URL + seed the database

1. After the first deploy, copy your service URL (e.g. `https://afrifx-academy.onrender.com`).
2. Add/update env var `PUBLIC_URL` to that exact URL, then **Manual Deploy → Deploy latest**
   (this makes certificate QR codes point to the live site).
3. Seed the demo admin/student/course: open the Render **Shell** tab and run:
   ```bash
   npm run seed
   ```
   This creates:
   - Admin: `admin@afrifx.com` / `admin123`
   - Student: `student@afrifx.com` / `student123`
   - A demo course with modules, lessons, and a quiz.

Done — visit your Render URL. 🎉

---

## Notes & limits (free tier)

- **Cold starts:** Render free services sleep after ~15 min idle; the first request
  then takes ~30–50s to wake. Normal for free hosting.
- **Neon** pauses the database after long inactivity but auto-resumes on the next query.
- **File storage:** uploads + cert PDFs live in Postgres. Neon free is 0.5 GB — plenty
  for a demo. For heavy file use later, move to object storage (e.g. Supabase Storage / S3).
- **Email:** optional. Without `SMTP_*` vars, emails are logged to the server console
  instead of sent — fine for a demo.

## Local development after this migration

The app now uses **Postgres, not SQLite**. To run locally, create `server/.env`
(see `server/.env.example`) with a `DATABASE_URL` — you can reuse the same Neon URL,
or run a local Postgres. Then:

```bash
cd server && npx prisma db push && npm run db:seed && npm run dev   # API :5000
cd client && npm run dev                                            # web :5173
```

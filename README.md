# Training Schedule App

A full-stack Node.js web app with:
- **Email/password auth**
- **Supabase (PostgreSQL)** for user storage
- **Training schedule** tool

---

## Project structure

```
training-app/
├── server.js               # Express entry point
├── .env.example            # Environment variable template
├── supabase/
│   └── schema.sql          # Database schema (run in Supabase SQL Editor)
├── config/
│   ├── supabase.js         # Supabase client (service role)
│   └── userStore.js        # User CRUD against Supabase
├── middleware/
│   └── auth.js             # requireAuth, redirectIfAuthenticated
├── routes/
│   ├── auth.js             # Register, login, logout
│   ├── user.js             # My schedules dashboard
│   └── schedule.js         # Schedule editor + save/load API
├── views/                  # HTML pages
└── public/
    ├── css/
    └── js/
```

---

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase database

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → **New query**
3. Paste and run the contents of `supabase/schema.sql` (new projects), or for existing projects run migrations as needed (`migrate_email_to_name.sql`, `training_schedules.sql`, `migrate_multiple_schedules.sql`)
4. Copy your **Project URL** and **service_role** key from **Project Settings → API**

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in your values
```

| Key | Description |
|-----|-------------|
| `SESSION_SECRET` | Long random string for signing cookies |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only, never expose to the browser) |

### 4. Run the app

```bash
npm run dev   # with auto-restart (nodemon)
# or
npm start     # production
```

Open http://localhost:3000

---

## Using the app

1. **Register / log in** → you land on **My training schedules** (`/user`)
2. **New schedule** → create a named plan and open the editor
3. **Rename** → update the schedule name from your dashboard
4. **Open** → edit workouts, then click **Save** to store changes in Supabase

---

## Authentication flow

1. **Register** → choose a name and password; session is created
2. **Login** → sign in with name and password
3. **Session** → user id + name stored in an encrypted session cookie

---

## Production checklist

- [ ] Set `NODE_ENV=production` and use HTTPS (cookie `secure: true`)
- [ ] Use a strong `SESSION_SECRET`
- [ ] Use a persistent session store (e.g. `connect-pg-simple`)
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only

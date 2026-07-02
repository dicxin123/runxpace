require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const scheduleRoutes = require('./routes/schedule');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel (and other reverse proxies) send X-Forwarded-For — required for rate-limit
app.set('trust proxy', 1);

// ─── View engine ────────────────────────────────────────────────────
app.set('view engine', 'html');
app.engine('html', require('fs').readFileSync.bind(null)); // use static HTML
app.use(express.static(path.join(__dirname, 'public')));

// ─── Body parsing ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session ────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.use(flash());

// Pass flash messages and user to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ─── Rate limiting ───────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  message: 'Too many login attempts. Please try again in 5 minutes.',
  validate: { xForwardedForHeader: false }
});

// ─── Routes ─────────────────────────────────────────────────────────
app.use('/auth', loginLimiter, authRoutes);
app.use('/user', requireAuth, userRoutes);
app.use('/schedule', requireAuth, scheduleRoutes);

// Home – redirect based on auth state
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/user');
  } else {
    res.redirect('/auth/login');
  }
});

// ─── 404 ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✅  Training Schedule App running at http://localhost:${PORT}\n`);
  });
}

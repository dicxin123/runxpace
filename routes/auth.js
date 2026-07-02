const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const userStore = require('../config/userStore');
const { redirectIfAuthenticated } = require('../middleware/auth');

const NAME_PATTERN = /^[a-z0-9 _-]{2,50}$/i;

function setSessionUser(req, user) {
  req.session.user = {
    id: user.id,
    name: user.name
  };
}

function validateName(name) {
  const trimmed = name.trim();
  if (!trimmed) return 'Name and password are required.';
  if (!NAME_PATTERN.test(trimmed)) {
    return 'Name must be 2–50 characters and use only letters, numbers, spaces, hyphens, or underscores.';
  }
  return null;
}

// ─── Register ────────────────────────────────────────────────────────
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/register.html'));
});

router.post('/register', async (req, res) => {
  const { name, password, confirmPassword } = req.body;

  const flash = (msg) => res.redirect(`/auth/register?error=${encodeURIComponent(msg)}`);
  const nameError = validateName(name || '');
  if (nameError) return flash(nameError);
  if (!password) return flash('Name and password are required.');
  if (password !== confirmPassword) return flash('Passwords do not match.');
  if (password.length < 8) return flash('Password must be at least 8 characters.');

  try {
    if (await userStore.findByName(name)) {
      return flash('An account with that name already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userStore.create({ name, passwordHash });

    setSessionUser(req, user);
    res.redirect(`/user?success=${encodeURIComponent('Account created — welcome!')}`);
  } catch (err) {
    console.error('Register error:', err.message, err.cause?.message || '');
    return flash('Something went wrong. Please try again.');
  }
});

// ─── Login ───────────────────────────────────────────────────────────
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/login.html'));
});

router.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await userStore.findByName(name || '');

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.redirect(`/auth/login?error=${encodeURIComponent('Invalid name or password.')}`);
    }

    setSessionUser(req, user);
    res.redirect('/user');
  } catch (err) {
    console.error('Login error:', err.message, err.cause?.message || '');
    return res.redirect(`/auth/login?error=${encodeURIComponent('Something went wrong. Please try again.')}`);
  }
});

// ─── Logout ──────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/auth/login'));
});

module.exports = router;

/**
 * Middleware: require an authenticated session.
 */
function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Please log in to continue.');
    return res.redirect('/auth/login');
  }
  next();
}

/**
 * Middleware: redirect already-logged-in users away from auth pages.
 */
function redirectIfAuthenticated(req, res, next) {
  if (req.session.user) {
    return res.redirect('/user');
  }
  next();
}

module.exports = { requireAuth, redirectIfAuthenticated };

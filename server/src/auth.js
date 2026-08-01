import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import { User } from './db.js';

export function setupAuth(app) {

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/auth/github/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ provider: 'github', providerId: profile.id });
            if (!user) {
              user = await User.create({
                provider: 'github',
                providerId: profile.id,
                name: profile.displayName || profile.username,
                avatar: profile.photos?.[0]?.value,
                email: profile.emails?.[0]?.value,
              });
            }
            done(null, user);
          } catch (err) {
            done(err);
          }
        },
      ),
    );

    app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));
    app.get(
      '/auth/github/callback',
      passport.authenticate('github', { failureRedirect: '/' }),
      (_req, res) => res.redirect('/?auth=success'),
    );
  } else {
    app.get('/auth/github', (_req, res) => {
      res.status(501).json({
        error: 'GitHub OAuth not configured',
        hint: 'Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env',
      });
    });
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ provider: 'google', providerId: profile.id });
            if (!user) {
              user = await User.create({
                provider: 'google',
                providerId: profile.id,
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value,
                email: profile.emails?.[0]?.value,
              });
            }
            done(null, user);
          } catch (err) {
            done(err);
          }
        },
      ),
    );

    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get(
      '/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/' }),
      (_req, res) => res.redirect('/?auth=success'),
    );
  }

  app.get('/auth/me', (req, res) => {
    res.json(req.user || null);
  });

  // ---- Local auth (email + password) ----
  app.post('/auth/signup', async (req, res) => {
    try {
      const { email, password, name } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'email and password required' });
      if (password.length < 8) return res.status(400).json({ error: 'password must be at least 8 characters' });

      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'email already in use' });

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        provider: 'local',
        providerId: email,
        email,
        name: name || email.split('@')[0],
        passwordHash,
      });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ error: 'login failed' });
        return res.json({ ok: true, user: { id: user._id, name: user.name, email: user.email } });
      });
    } catch {
      return res.status(500).json({ error: 'signup failed' });
    }
  });

  app.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'email and password required' });

      const user = await User.findOne({ email, provider: 'local' });
      if (!user) return res.status(401).json({ error: 'invalid credentials' });

      const ok = await bcrypt.compare(password, user.passwordHash || '');
      if (!ok) return res.status(401).json({ error: 'invalid credentials' });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ error: 'login failed' });
        return res.json({ ok: true, user: { id: user._id, name: user.name, email: user.email } });
      });
    } catch {
      return res.status(500).json({ error: 'login failed' });
    }
  });

  app.post('/auth/logout', (req, res) => {
    req.logout?.(() => {});
    res.json({ ok: true });
  });
}


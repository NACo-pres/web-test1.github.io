const passport = require('passport');
const { OIDCStrategy } = require('passport-azure-ad');
const session = require('express-session');

// Azure AD authentication configuration
const config = {
  clientID: 'your-client-id', // Replace with Azure AD client ID
  clientSecret: 'your-client-secret', // Replace with Azure AD client secret
  tenantID: 'your-tenant-id', // Replace with Azure AD tenant ID
  redirectUrl: 'https://localhost:5000/auth/callback', // Ensure this is the correct redirect URL
  responseType: 'code',
  responseMode: 'query',
  scope: ['openid', 'profile', 'email'],
  validateIssuer: true, // Enable issuer validation in production
  passReqToCallback: false,
  
  // Provide the OIDC metadata URL for Azure AD
  identityMetadata: `https://login.microsoftonline.com/${'your-tenant-id'}/v2.0/.well-known/openid-configuration`,
};

// Initialize OIDC strategy with Azure AD
passport.use(new OIDCStrategy(
  config,
  (issuer, sub, profile, accessToken, refreshToken, done) => {
    // You can perform additional actions like saving the user profile to DB
    return done(null, profile);
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Session setup to handle user authentication sessions
function initializeSession(app) {
  app.use(session({
    secret: 'your-session-secret', // Use a secure secret
    resave: false,
    saveUninitialized: true,
  }));

  app.use(passport.initialize());
  app.use(passport.session());
}

// Export the OIDC routes and session initializer
function setupAuthRoutes(app) {
  // Azure AD authentication routes
  app.get('/auth/login', (req, res, next) => {
    passport.authenticate('azuread-openidconnect', {
      response: res,
      failureRedirect: '/'
    })(req, res, next);
  });

  // The callback route where Azure AD will redirect the user after successful login
  app.get('/auth/callback', (req, res, next) => {
    passport.authenticate('azuread-openidconnect', {
      failureRedirect: '/'
    })(req, res, next), (err, user, info) => {
      if (err || !user) {
        return res.redirect('/');
      }
      req.login(user, (err) => {
        if (err) {
          return res.redirect('/');
        }
        return res.redirect('/dashboard');  // Redirect to a dashboard page or home
      });
    };
  });

  // Protected route (you must be logged in to access this)
  app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/auth/login');
    }
    res.send('Welcome to your dashboard!');
  });
}

module.exports = { passport, initializeSession, setupAuthRoutes };

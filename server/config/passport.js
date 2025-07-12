const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // User exists, return user
        done(null, user);
      } else {
        // Create new user
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value, // Assuming email is always provided
          avatar: profile.photos[0]?.value // Assuming avatar is provided
          // Password is not required for Google OAuth users
        });
        await user.save();
        done(null, user);
      }
    } catch (error) {
      console.error('Error in Google OAuth strategy:', error);
      done(error, null);
    }
  }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password'); // Exclude password
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

module.exports = passport;
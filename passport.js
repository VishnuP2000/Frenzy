const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy


require('dotenv').config()

passport.use(new GoogleStrategy({
    clientID: process.env.ClintID,
    clientSecret: process.env.ClintSecret,
    callbackURL: "https://frenzzy.online/auth/google/callback",
    passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }

))

passport.serializeUser((user, done) => {
    done(null, user);
})
passport.deserializeUser(function (user, done) {
    done(null, user);
})
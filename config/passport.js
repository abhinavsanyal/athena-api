// config/passport.js

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");
const passportJwt = require("./jwt.strategy");

module.exports = function (passport) {
  passportJwt(passport);
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://aggressive-hen-tie.cyclic.app/api/auth/google/callback",
        passReqToCallback   : true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console,log("profile:::::::::",profile);
          const existingUser = await User.findOne({
            email: profile.emails[0].value,
          });

          if (existingUser) {
            return done(null, existingUser);
          }

          const newUser = new User({
            email: profile.emails[0].value,
            password: "", // You may want to handle this differently since Google users won't have a password
          });

          await newUser.save();
          done(null, newUser);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

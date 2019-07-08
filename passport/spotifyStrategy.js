const SpotifyStrategy = require('passport-spotify').Strategy;
const passport = require("passport");
const User = require("../models/User");



passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.client_id,
      clientSecret: process.env.client_secret,
      callbackURL: 'http://localhost:3000/auth/spotify/callback',
      scope: ["user-read-email", "user-read-private", "playlist-read-collaborative", "playlist-modify-private", "playlist-modify-public", "playlist-read-private"]
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
      console.log("profile", profile)
      
      User.findOne({ spotifyId: profile.id })
       .then(user => {
         if (user) {
           done(null, user); // To login the user
         } else {
           User.create({
             username: profile.displayName,
             spotifyId: profile.id,
           }).then(newUser => {
             done(null, newUser); // To login newUser
           });
         }
       })
       .catch(err => done(err));
    }
  )
);


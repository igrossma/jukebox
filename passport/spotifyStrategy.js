const SpotifyStrategy = require('passport-spotify').Strategy;
const passport = require("passport");
const User = require("../models/User");



passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/spotify/callback',
      scope: ["user-read-email", "user-read-private", "playlist-read-collaborative", "playlist-modify-private", "playlist-modify-public", "playlist-read-private"],
      showDialog: true
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
      // console.log("TCL: accessToken", accessToken)
      // console.log("TCL: refreshToken", refreshToken)
      // console.log("TCL: expires_in", expires_in)
      // console.log("profile", profile)
      
      User.findOne({ spotifyId: profile.id })
       .then(user => {
         if (user) {
           done(null, user); // To login the user
         } else {
           User.create({
             username: profile.displayName,
             spotifyId: profile.id,
             accessToken, 
             refreshToken
           }).then(newUser => {
             done(null, newUser); // To login newUser
           });
         }
       })
       .catch(err => done(err));
    }
  )
);


const express = require("express");
const passport = require('passport');
const router = express.Router();
const User = require("../models/User");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


router.get("/", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});

// Spotify Login
router.get('/spotify', passport.authenticate('spotify'), function(req, res) {
  // The request will be redirected to spotify for authentication, so this
  // function will not be called.
});

router.get(
  '/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/playlists');
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
 
});

module.exports = router;

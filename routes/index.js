const express = require("express");
const router = express.Router();
const { setSpotifyApi } = require("../middlewares");
const Playlist = require("../models/Playlist");


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/playlists", (req, res, next) => {
  res.render("playlists");
});

// Get Create Playlist Page
router.get("/create-playlist", (req, res, next) => {
  res.render("create-playlist");
});

// Create Playlist in Spotify-Account
router.post("/create-playlist", setSpotifyApi, (req, res, next) => {
  let name = req.body.playlistName;

  res.spotifyApi
    .createPlaylist(req.user.spotifyId, name, { public: false })
    .then(function(data) {
      console.log("Created playlist!", data);
      res.render("create-playlist");
    })
    .catch(function(err) {
      console.log("noooooooo");
      next(err);
    });

});

// Get Add Playlist Page
router.get("/add-playlist", (req, res, next) => {


  res.spotifyApi.getUserPlaylists(req.user.spotifyId)
    .then(function(data) {
    console.log('Retrieved playlists', data.body.items);

    res.render("add-playlists", {
      playlist: data.body.items,
      
    })
  }).catch(function(err) {
    console.log('Something went wrong!', err);
  }); 
});


router.get("/playlist-details/:playlist_id", (req, res, next) => {
  let playlistID = req.params.playlist_id;

  res.render("playlist-details");
});

module.exports = router;

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

// Create Playlist
router.get("/create-playlist", (req, res, next) => {
  res.render("create-playlist");
});


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

router.get("/add-playlist", (req, res, next) => {
  res.render("add-playlist");
});

router.post("/add-playlist", setSpotifyApi, (req, res, next) => {
  let search = req.body.playlistName;

  res.spotifyApi.getUserPlaylists(req.user.spotifyId)
    .then(function(data) {
    console.log("This is what i type in the search bar", search)
    console.log('Retrieved playlists', data.body.items);
  },function(err) {
    console.log('Something went wrong!', err);
  })

  Playlist.create()

  // take the input of the search form and ask spotify if the playlist exist or not
  // if yes - show the playlist and a button add and then
  //redirect to playlist

  res.redirect("playlists");
});

router.get("/playlist-details/:playlist_id", (req, res, next) => {
  let playlistID = req.params.playlist_id;

  res.render("playlist-details");
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { setSpotifyApi } = require("../middlewares");
const Playlist = require("../models/Playlist");


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

// GET ALL PLAYLISTS OF ALL USER
router.get("/playlists", (req, res, next) => {

  Playlist.find().then(playlist => {
    res.render("playlists", {
      playlist
    });
  })
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

      Playlist.create({
        name: data.body.name,
        _creator: req.user.spotifyId,
        visibility: data.body.collaborative,
        tracks: data.body.tracks.items
      })

      res.render("create-playlist");
    })
    .catch(function(err) {
      console.log("noooooooo");
      next(err);
    });

});

// Get Add Playlist Page
router.get("/add-playlist", setSpotifyApi, (req, res, next) => {


  res.spotifyApi.getUserPlaylists(req.user.spotifyId)
    .then(function(data) {
    console.log('Retrieved playlists', data.body.items[5].images);

    res.render("add-playlist", {
      playlist: data.body.items
    })
  }).catch(function(err) {
    console.log('Something went wrong!', err);
  }); 
});

router.get("/add-playlist/:playlist_id", setSpotifyApi, (req, res, next) => {
  
  res.spotifyApi.getPlaylist(req.params.playlist_id)
  .then(function(data) {
    //console.log('Some information about this playlist', data.body);

    Playlist.create({
      name: data.body.name,
      _creator: req.user.spotifyId,
      visibility: data.body.collaborative,
      tracks: data.body.tracks.items
    })

    res.redirect("/playlists")

  }).catch(function(err) {
    console.log('Something went wrong!', err);
  });

})


router.get("/playlist-details/:playlist_id", (req, res, next) => {
  let playlistID = req.params.playlist_id;


  
  res.render("playlist-details");
});

module.exports = router;

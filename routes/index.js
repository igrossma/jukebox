const express = require("express");
const router = express.Router();
const multer  = require('multer');
const uploadCloud = require('../config/cloudinary.js');
const { setSpotifyApi } = require("../middlewares");
const Playlist = require("../models/Playlist");
const { pushPlaylistToSpotify } = require("../helpers");

// ----------------- HOME PAGE with GET-------------------
router.get("/", (req, res, next) => {
  res.render("index", {
    message: req.flash("error"),
    layout: "layout-without-navbar"
  });
});

// --------- GET ALL PLAYLISTS from our DATABASE OF ALL USER-----------------
router.get("/playlists", (req, res, next) => {
  Playlist.find()

    .populate("_creator")
    .then(playlist => {
      if (req.user) {
        var connectedUserId = req.user._id;
      }
      // console.log("TCL: playlist creator ID", playlist[0]._creator._id)
      // console.log("Connected user ID", req.user._id)
      res.render("playlists", {
        playlist,
        connectedUserId
      });
    });
});

// ----------------- RENDER Create Playlist Page GET-----------------
router.get("/create-playlist", (req, res, next) => {
  res.render("create-playlist");
});


// ----------------- CREATE New Playlist in Spotify-Account----------------- 
router.post("/create-playlist", setSpotifyApi, uploadCloud.single('photo'), (req, res, next) => {
  let name = req.body.playlistName;
  let imgPath = req.file.url;
  let location = req.body.location;

  res.spotifyApi
    .createPlaylist(req.user.spotifyId, name, { public: false })
    .then(function(data) {
      console.log("Created playlist!", data);

      Playlist.create({
        spotifyPlaylistId: data.body.id,
        name: data.body.name,
        _creator: req.user._id,
        location: location,
        imgPath: imgPath,
        visibility: data.body.collaborative
      });

      res.redirect("/playlists");
    })
    .catch(function(err) {
      console.log("noooooooo");
      next(err);
    });
});

// ----------- Look at all Playlists of the Logged-in User of the Spotify-Account-----------------
router.get("/add-playlist", setSpotifyApi, (req, res, next) => {
  res.spotifyApi
    .getUserPlaylists(req.user.spotifyId)
    .then(function(data) {
      //console.log("Retrieved playlists", data.body.items[5].images);

      res.render("add-playlist", {
        playlist: data.body.items
      });
    })
    .catch(function(err) {
      console.log("Something went wrong!", err);
      next(err);
    });
});

// ----------------- Add the spotify-Playlist with all the tracks to our database-----------------
router.get("/add-playlist/:playlist_id", setSpotifyApi, (req, res, next) => {
  res.spotifyApi
    .getPlaylist(req.params.playlist_id)
    .then(function(data) {
      let tracksfromSpotify = [];
      for (let i = 0; i < data.body.tracks.items.length; i++) {
        let track = data.body.tracks.items[i].track;
        //console.log("TCL: tracksfromSpotify", track);
        tracksfromSpotify.push({
          name: track.name,
          spotifyTrackId: track.id,
          artist: track.artists[0].name,
          _owner: req.user._id
        });
      }

      // console.log("OUR ITEMS", data.body.tracks.items)
      Playlist.create({
        name: data.body.name,
        spotifyPlaylistId: data.body.id,
        _creator: req.user._id, //before it was spotifyId
        visibility: data.body.collaborative,
        tracks: tracksfromSpotify
      });

      res.redirect("/playlists");
    })
    .catch(function(err) {
      console.log("Something went wrong!", err);
    });
});

// ----------------- Sorting the Playlist by number of votes and pushing to spotify-----------------
router.get("/playlist-details/:playlist_id", setSpotifyApi,(req, res, next) => {
    let playlistID = req.params.playlist_id;

    res.spotifyApi
    .getMyCurrentPlaybackState({})
    .then(function(data) {
        // Output items
        console.log("Now Playing: ", data.body);
      },
      function(err) {
        console.log("Something went wrong!", err);
      }
    );

    //Push playlist to spotify every 20 seconds
    setInterval(() => {
      pushPlaylistToSpotify(playlistID, res.spotifyApi)
        .then(() => {
          res.redirect("/playlist-details/" + playlistID);
        })
        .catch(err => next(err));
    }, 20000);

    Playlist.findById(playlistID)
      .populate("_owner")
      .then(playlist => {
        // console.log("TCL: playlist tracks", playlist.tracks[0].track.artists[0].name);
        // console.log("DEBUG USER WHO VOTED",playlist.tracks[0]._userWhoVoted)
        // console.log("DEBUG POULATED OWNER",playlist.tracks[0]._owner, "req.user._id", req.user._id)
        res.render("playlist-details", {
          track: playlist.tracks.sort(
            (a, b) => b._userWhoVoted.length - a._userWhoVoted.length
          ),
          playlistID,
          user: req.user
        });
      });
  }
);

// ----------------- Display songs based on search-Bar-----------------
router.get("/playlist-details/:playlistID/add-song",setSpotifyApi,(req, res, next) => {
    let search = req.query.search;
    if (!search) {
      res.render("add-song", {
        playlistId: req.params.playlistID
      });
    } else {
      console.log("ELSE!!!!");
      res.spotifyApi
        .searchTracks(search, { limit: 10 })
        .then(data => {
          // console.log('Search by "Love"', data.body.tracks.items);
          res.render("add-song", {
            songs: data.body.tracks.items,
            playlistId: req.params.playlistID,
            search
          });
        })
        .catch(err => next(err));
    }
  }
);

//----------------- Add songs to playlist ----------------------
router.get("/playlist-details/:playlist_id/add-song/:songId",setSpotifyApi,
  (req, res, next) => {
    let playlistId = req.params.playlist_id;
    let songId = req.params.songId;
    console.log("SONGID", songId);
    res.spotifyApi
      .getTrack(songId)
      .then(data => {
        //console.log('DEBUG-Search by ID', data.body);
        Playlist.updateOne(
          { _id: playlistId },
          {
            $push: {
              tracks: {
                name: data.body.name,
                artist: data.body.artists[0].name,
                spotifyTrackId: data.body.id,
                _owner: req.user._id
              }
            }
          }
        )
          .then(playlist => {
            res.redirect(`/playlist-details/${playlistId}`);
          })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  }
);

// TODO: protect the route for connected users
//----------------- Vot for songs --------------
router.get("/vote/:songId/:playlistId", (req, res, next) => {
  let playlistId = req.params.playlistId;
  let songId = req.params.songId;

  Playlist.findById(playlistId)
    .then(playlist => {
      // Loop through the tracks and increment numberOfvotes for the right track
      for (let i = 0; i < playlist.tracks.length; i++) {
        if (songId === playlist.tracks[i].spotifyTrackId) {
          // playlist.tracks[i].numberOfvotes++ //this used to be commented
          if (
            !playlist.tracks[i]._userWhoVoted
              .map(id => id.toString())
              .includes(req.user._id.toString())
          ) {
            playlist.tracks[i]._userWhoVoted.push(req.user._id);
          }
        }
      }
      return playlist.save();
    })
    .then(() => {
      res.redirect(`/playlist-details/${playlistId}`);
    })
    .catch(err => next(err));
});

//-------------------Route for button to push playlist to spotify -----------------
router.get( "/playlist-details/:playlist_id/push", setSpotifyApi, (req, res, next) => {
    //     let playlistId = req.params.playlist_id;
    //     pushPlaylistToSpotify(playlistId, res.spotifyApi)
    //       .then(() => {
    //         res.redirect("/playlist-details/" + playlistId);
    //       })
    //       .catch(err => next(err));
  }
);

module.exports = router;

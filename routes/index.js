const express = require("express");
const router = express.Router();
const { setSpotifyApi } = require("../middlewares");
const Playlist = require("../models/Playlist");
const { pushPlaylistToSpotify } = require("../helpers");
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
  });
});

// Get Create Playlist Page
router.get("/create-playlist", (req, res, next) => {
  res.render("create-playlist");
});

// Create New Playlist in Spotify-Account
router.post("/create-playlist", setSpotifyApi, (req, res, next) => {
  let name = req.body.playlistName;

  res.spotifyApi
    .createPlaylist(req.user.spotifyId, name, { public: false })
    .then(function(data) {
      console.log("Created playlist!", data);

      Playlist.create({
        spotifyPlaylistId: data.body.id,
        name: data.body.name,
        _creator: req.user._id,
        visibility: data.body.collaborative
      });

      res.redirect("/playlists");
    })
    .catch(function(err) {
      console.log("noooooooo");
      next(err);
    });
});

// Get Add Playlist Page
router.get("/add-playlist", setSpotifyApi, (req, res, next) => {
  res.spotifyApi
    .getUserPlaylists(req.user.spotifyId)
    .then(function(data) {
      console.log("Retrieved playlists", data.body.items[5].images);

      res.render("add-playlist", {
        playlist: data.body.items
      });
    })
    .catch(function(err) {
      console.log("Something went wrong!", err);
    });
});

router.get("/add-playlist/:playlist_id", setSpotifyApi, (req, res, next) => {
  res.spotifyApi
    .getPlaylist(req.params.playlist_id)
    .then(function(data) {
      let tracksfromSpotify = [];
      for (let i = 0; i < data.body.tracks.items.length; i++) {
        let track = data.body.tracks.items[i].track;
        console.log("TCL: tracksfromSpotify", track);
        tracksfromSpotify.push({
          name: track.name,
          spotifyTrackId: track.id,
          artist: track.artists[0].name
        });
      }

      // console.log("OUR ITEMS", data.body.tracks.items)
      // console.log("TCL: track", track)
      // console.log("TCL: trackName", trackName)
      // console.log("TCL: trackArtistName", trackArtistName)

      Playlist.create({
        name: data.body.name,
        spotifyPlaylistId: data.body.id,
        _creator: req.user.spotifyId,
        visibility: data.body.collaborative,
        tracks: tracksfromSpotify
      });

      res.redirect("/playlists");
    })
    .catch(function(err) {
      console.log("Something went wrong!", err);
    });
});

// TODO: change the sort
router.get("/playlist-details/:playlist_id", (req, res, next) => {
  let playlistID = req.params.playlist_id;
  Playlist.findById(playlistID).then(playlist => {
    // console.log("TCL: playlist track name", playlist.tracks[0].track.name);
    // console.log("TCL: playlist tracks", playlist.tracks[0].track.artists[0].name);

    res.render("playlist-details", {
      track: playlist.tracks.sort((a,b) => a.name > b.name ? 1 : -1),
      playlistID
    });
  });
});

router.get(
  "/playlist-details/:playlistID/add-song",
  setSpotifyApi,
  (req, res, next) => {
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

router.get(
  "/playlist-details/:playlist_id/add-song/:songId",
  setSpotifyApi,
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
                //"numberOfvotes": {type:Number, default:0 },
                artist: data.body.artists[0].name,
                spotifyTrackId: data.body.id
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

// router.get("/vote/:songId",(res, req, next) => {
//   let songId = req.params.songId

//   Playlist.findByIdAndUpdate({ i })
// })

// TODO: protect the route for connected users
router.get("/vote/:songId/:playlistId", (req, res, next) => {
  let playlistId = req.params.playlistId;
  let songId = req.params.songId

  Playlist.findById(playlistId)
    .then(playlist => {
      // Loop through the tracks and increment numberOfvotes for the right track
      for (let i = 0; i < playlist.tracks.length; i++) {
        if (songId === playlist.tracks[i].spotifyTrackId) {
          // playlist.tracks[i].numberOfvotes++
          if (!playlist.tracks[i]._userWhoVoted.map(id=>id.toString()).includes(req.user._id.toString())) {
            playlist.tracks[i]._userWhoVoted.push(req.user._id)
          }
        }
      }
      return playlist.save()
    })
    .then(() => {
      res.redirect(`/playlist-details/${playlistId}`);
    })
    .catch(next)
  
//   Playlist.findByIdAndUpdate(songId, {
//    $inc: { numberOfvotes: 1 }
//  }).then(() => {
//   console.log("are you here")
//   console.log("DEBUBG", songId)

//   res.redirect(`/playlist-details/${playlistId}`);
//  }).catch(err => next(err));
});


router.get("/playlist-details/:playlist_id/push", setSpotifyApi, (req, res, next) => {
  let playlistId = req.params.playlist_id


  pushPlaylistToSpotify(playlistId, res.spotifyApi)
    .then(() => {
      res.redirect("/playlist-details/"+playlistId)
    })
    .catch(next)
})

module.exports = router;

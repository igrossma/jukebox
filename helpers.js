const Playlist = require("./models/Playlist");

// This function returns a Promise
function pushPlaylistToSpotify(playlistId, spotifyApi) {
  return new Promise((resolve,reject) => {
    Playlist.findById(playlistId)
    .then(playlist => {
      spotifyApi.getPlaylist(playlist.spotifyPlaylistId)
      .then((data) => {
        // console.log('Some information about this playlist', data.body.tracks.items);
        let tracksInfo = data.body.tracks.items.map(item => ({ uri : item.track.uri }))
        // console.log("TCL: tracksInfo", tracksInfo)
        spotifyApi.removeTracksFromPlaylist(playlist.spotifyPlaylistId, tracksInfo) //, 'MSw4Y2NlZjFjMTA5ZmU4ZDA4OGZkN2ZiNzM1YTZkMWVlMGQ4ZmJlMjk3')
        .then((data) => {
          console.log('Tracks removed from playlist!');
          let trackStrings = playlist.tracks
            .sort(function sortF(a,b) {
              if (a._userWhoVoted.length < b._userWhoVoted.length) {
                  return 1;
              } else if (a._userWhoVoted.length > b._userWhoVoted.length) { 
                  return -1;
              }
          
              // Else go to the 2nd item
              if (a.time < b.time) { 
                  return -1;
              } else if (a.time > b.time) {
                  return 1
              } else { // nothing to split them
                  return 0;
              }
          }
              // (a, b) => b._userWhoVoted.length - a._userWhoVoted.length
            )

            .map(track => "spotify:track:"+track.spotifyTrackId)
            // .slice(0,3) // To take the first 3 songs
          spotifyApi.addTracksToPlaylist(playlist.spotifyPlaylistId, trackStrings)
            .then(data => {
              console.log('Added tracks to playlist!');
              resolve(undefined)
            })
            .catch(reject)
        })
        .catch(reject)
      })
      .catch(reject)
    })
    .catch(reject)
  })
}




module.exports = {
  pushPlaylistToSpotify,
}
const SpotifyWebApi = require("spotify-web-api-node");
const User = require("./models/User");
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// This middleware check if the user is connected
// and refreshes the access token and configure 
// a `res.spotifyApi` with the token of the connected user
function setSpotifyApi(req, res, next) {
  if (!req.user) {
    res.redirect("/");
    return;
  }
  res.spotifyApi = spotifyApi;
  res.spotifyApi.setRefreshToken(req.user.refreshToken);
  res.spotifyApi
    .refreshAccessToken()
    .then(data =>{
      User.findByIdAndUpdate(
        req.user._id,
        {
          accessToken: data.body.access_token
        },
        { new: true } // option of Mongoose to find the latest user
      )
    
    .then(updatedUser => {
      res.spotifyApi.setAccessToken(updatedUser.accessToken);
      next();
    })}
    );
}

module.exports = {
  setSpotifyApi
};

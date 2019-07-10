const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    name: String,
    spotifyPlaylistId: String,
    _creator: String,
    visibility: Boolean,
    tracks: [{
      name: String,
      numberOfvotes: {type:Number, default:0 },
      artist: String,
      spotifyTrackId: String
    }]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;

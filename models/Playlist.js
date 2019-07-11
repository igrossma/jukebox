const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    name: String,
    spotifyPlaylistId: String,
    _creator: {type: Schema.Types.ObjectId, ref: "User"},
    visibility: Boolean,
    location: {type: String, default: "Rua de São Bento"},
    tracks: [{
      name: String,
      numberOfvotes: {type:Number, default:0 },
      artist: String,
      spotifyTrackId: String,
      _userWhoVoted: [{ type: Schema.Types.ObjectId, ref: "User" }] ,
      _owner: {type: Schema.Types.ObjectId, ref: "User"},
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

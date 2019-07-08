const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    name: String,
    _creator: String,
    visibility: Boolean,
    tracks: Array
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

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    name: String,
    spotifyPlaylistId: String,
    _creator: {type: Schema.Types.ObjectId, ref: "User"},
    visibility: Boolean,
    imgName: String,
    imgPath: {type: String },
    location: {type:String, default:"Ironhack, Rua de São Bento 31, 1200-109 Lisboa" },
    tracks: [{
      name: String,
      numberOfvotes: {type:Number, default:0 },
      artist: String,
      spotifyTrackId: String,
      _userWhoVoted: [{ type: Schema.Types.ObjectId, ref: "User" }] ,
      _owner: {type: Schema.Types.ObjectId, ref: "User"},
      time : { type : Date, default: Date.now }
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

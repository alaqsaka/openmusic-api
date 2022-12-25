const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongsToPlaylist(playlistId, songId) {
    console.log("addSongsToPlaylist");
    const id = `playlist-songs-${nanoid(16)}`;

    // cek apakah song ada di database

    // cek apakah playlist ada di database

    const query = {
      text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan lagu ke playlist");
    }

    return result.rows[0].id;
  }
}

module.exports = PlaylistSongsService;

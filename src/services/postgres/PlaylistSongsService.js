const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapDBToModelSong } = require("../../utils");

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongsToPlaylist(playlistId, songId) {
    const id = `playlist-songs-${nanoid(16)}`;

    // cek apakah song ada di database
    const getSongByIdQuery = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [songId],
    };

    const resultGetSongById = await this._pool.query(getSongByIdQuery);

    if (!resultGetSongById.rows.length) {
      throw new NotFoundError("Song tidak ditemukan");
    }

    if (!resultGetSongById.rows.length) {
      return resultGetSongById.rows.map(mapDBToModelSong)[0];
    }

    const query = {
      text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan lagu ke playlist");
    }

    if (!resultGetSongById.rows.length) {
      return result.rows.map(mapDBToModelSong)[0];
    }

    return result.rows[0].id;
  }
}

module.exports = PlaylistSongsService;

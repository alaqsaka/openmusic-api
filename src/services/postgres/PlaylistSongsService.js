const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const {
  mapDBToModelSong,
  mapDBToModelSongs,
  mapDBToModelPlaylist,
  mapDBToModelPlaylistGet,
} = require("../../utils");

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongsToPlaylist(playlistId, songId) {
    const id = `playlist-songs-${nanoid(16)}`;

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

  async getPlaylistById(playlistId) {
    const query = {
      text: "SELECT playlists.*, users.* FROM playlists LEFT JOIN users on users.id = playlists.owner WHERE playlists.id = $1",
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelPlaylistGet)[0];
  }

  async getPlaylistSongsByPlaylistId(playlistId) {
    const queryGetSongsByPlaylistId = {
      text: "SELECT songs.* FROM songs FULL OUTER JOIN playlist_songs ON songs.id=playlist_songs.song_id WHERE playlist_songs.playlist_id = $1",
      values: [playlistId],
    };

    const resultGetSongsByPlaylistId = await this._pool.query(
      queryGetSongsByPlaylistId
    );

    return resultGetSongsByPlaylistId.rows.map(mapDBToModelSongs);
  }

  async deleteSongOnPlaylist(playlistId, songId) {
    console.log(playlistId, songId);
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = PlaylistSongsService;

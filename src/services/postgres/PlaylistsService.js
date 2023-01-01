const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
// const NotFoundError = require("../../exceptions/NotFoundError");

const {
  mapDBToModelPlaylist,
  mapDBToModelPlaylistGet,
} = require("../../utils");

class PlaylistsService {
  constructor(playlistSongsService, producerService) {
    this._pool = new Pool();
    this._playlistSongsService = playlistSongsService;
    this._producerService = producerService;
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(16);

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows.map(mapDBToModelPlaylist)[0].id;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
    }
  }

  async getPlaylists(owner) {
    const query = {
      text: "SELECT playlists.*, users.* FROM playlists LEFT JOIN users on users.id = playlists.owner WHERE playlists.owner = $1",
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelPlaylistGet);
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = PlaylistsService;

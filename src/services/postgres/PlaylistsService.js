const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
// const NotFoundError = require("../../exceptions/NotFoundError");
const { mapDBToModelPlaylist } = require("../../utils");

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name }) {
    const id = nanoid(16);

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, NULL, $3, $4) RETURNING id",
      values: [id, name, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows.map(mapDBToModelPlaylist)[0].id;
  }
}

module.exports = PlaylistsService;

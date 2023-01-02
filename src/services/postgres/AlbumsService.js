const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapDBToModelAlbum } = require("../../utils");

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return result.rows.map(mapDBToModelAlbum)[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query("SELECT * FROM albums");
    return result.rows.map(mapDBToModelAlbum);
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT * FROM albums WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    return result.rows.map(mapDBToModelAlbum)[0];
  }

  async checkLikeAlbum(albumId, credentialId) {
    console.log("cek like albums");

    const query = {
      text: `SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2`,
      values: [albumId, credentialId],
    };

    const result = await this._pool.query(query);
    console.log(result);
    return result.rows;
  }

  async postLike(albumId, credentialId) {
    console.log(albumId, credentialId);
    const id = nanoid(16);

    const query = {
      text: `INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id`,
      values: [id, credentialId, albumId],
    };

    const result = await this._pool.query(query);
    await this._cacheService.delete(`albumLikes:${albumId}`);
    return result;
  }

  async deleteLike(albumId, credentialId) {
    const query = {
      text: `DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id`,
      values: [albumId, credentialId],
    };

    const result = await this._pool.query(query);
    await this._cacheService.delete(`albumLikes:${albumId}`);
    if (!result.rows.length) {
      throw new NotFoundError("ALbum gagal dihapus. Id tidak ditemukan");
    }
  }

  async getAlbumLikes(albumId) {
    try {
      // get album likes from cache
      const result = await this._cacheService.get(`albumLikes:${albumId}`);
      console.log(typeof result);
      return result;
    } catch (error) {
      // bila gagal, diteruskan dengan mendapatkan jumlah likes dari database
      const query = {
        text: `SELECT COUNT (*) FROM user_album_likes WHERE album_id = $1`,
        values: [albumId],
      };

      // jumlah likes album disimpan pada cache
      const result = await this._pool.query(query);
      await this._cacheService.set(
        `albumLikes:${albumId}`,
        JSON.stringify(result)
      );
      console.log(typeof result);
      return result;
    }
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: "UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);
    await this._cacheService.delete(`albumLikes:${id}`);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    await this._cacheService.delete(`albumLikes:${id}`);
    if (!result.rows.length) {
      throw new NotFoundError("ALbum gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = AlbumsService;

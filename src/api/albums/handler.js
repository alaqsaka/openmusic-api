const ClientError = require("../../exceptions/ClientError");

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postLikeHandler = this.postLikeHandler.bind(this);
    this.getLikesCount = this.getLikesCount.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name = "untitled", year } = request.payload;

      const albumId = await this._service.addAlbum({ name, year });

      const response = h.response({
        status: "success",
        message: "Menambahkan Album",
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: "success",
      data: {
        albums,
      },
    };
  }

  async getLikesCount(request, h) {
    try {
      const { albumId } = request.params;
      // Cek apakah album tersedia
      const album = await this._service.getAlbumById(albumId);

      // get likes count
      const likesCount = await this._service.getAlbumLikes(albumId);

      if (typeof likesCount === "string") {
        const response = h.response({
          status: "success",
          data: {
            likes: Number(JSON.parse(likesCount).rows[0].count),
          },
        });
        response.header("X-Data-Source", "cache");
        response.code(200);
        return response;
      } else {
        const response = h.response({
          status: "success",
          data: {
            likes: Number(likesCount.rows[0].count),
          },
        });
        response.code(200);
        return response;
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postLikeHandler(request, h) {
    try {
      const { albumId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      // Cek apakah album tersedia
      const album = await this._service.getAlbumById(albumId);

      // Cek apakah user sudah like atau belum
      const checkLike = await this._service.checkLikeAlbum(
        albumId,
        credentialId
      );
      console.log("check like ", checkLike);
      if (checkLike.length === 0) {
        console.log("belum like");
        const postLike = await this._service.postLike(albumId, credentialId);
        const response = h.response({
          status: "success",
          message: "Berhasil menambah like",
          id: postLike.id,
        });

        response.code(201);
        return response;
      } else {
        console.log("udah like");
        const deleteLike = await this._service.deleteLike(
          albumId,
          credentialId
        );

        const response = h.response({
          status: "success",
          message: "Berhasil menghapus like",
        });
        response.code(201);
        return response;
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;

      const album = await this._service.getAlbumById(id);

      return {
        status: "success",
        data: {
          album: album,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      const { name, year } = request.payload;
      const album = await this._service.editAlbumById(id, { name, year });

      return {
        status: "success",
        message: "Sukses mengedit album",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this._service.deleteAlbumById(id);

      return {
        status: "success",
        message: "Album berhasil dihapus",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AlbumsHandler;

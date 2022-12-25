const ClientError = require("../../exceptions/ClientError");

class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postSongsToPlaylistHandler =
      this.postSongsToPlaylistHandler.bind(this);
  }

  async postSongsToPlaylistHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;
      const { songId } = request.payload;

      console.log(playlistId, songId);

      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      // cek apakah song ada di database

      // cek apakah playlist ada di database

      const playlistSongsId =
        await this._playlistSongsService.addSongsToPlaylist(playlistId, songId);

      const response = h.response({
        status: "success",
        message: "Lagu  berhasil ditambahkan ke playlist",
        data: {
          playlistSongsId,
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
}

module.exports = PlaylistSongsHandler;

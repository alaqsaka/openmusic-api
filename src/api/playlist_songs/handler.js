const ClientError = require("../../exceptions/ClientError");

class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postSongsToPlaylistHandler =
      this.postSongsToPlaylistHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deleteSongOnPlaylistHandler =
      this.deleteSongOnPlaylistHandler.bind(this);
  }

  async postSongsToPlaylistHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;
      const { songId } = request.payload;

      this._validator.validatePlaylistSongPayload({
        playlistId,
        songId,
      });

      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

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

  async getPlaylistSongsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;
      // const { songId } = request.payload;
      // // validate payload
      // this._validator.validatePlaylistSongPayload({
      //   playlistId,
      //   songId,
      // });

      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      const playlistData = await this._playlistSongsService.getPlaylistById(
        playlistId
      );

      // console.log("playlist data ", playlistData);

      const songsData =
        await this._playlistSongsService.getPlaylistSongsByPlaylistId(
          playlistId
        );

      // console.log(songsData);

      // console.log("get playlist songs");

      const response = h.response({
        status: "success",
        data: {
          playlist: {
            ...playlistData,
            songs: songsData,
          },
        },
      });
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

  async deleteSongOnPlaylistHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;
      const { songId } = request.payload;
      console.log(playlistId);
      console.log(songId);
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      this._validator.validatePlaylistSongPayload({
        playlistId,
        songId,
      });

      this._playlistSongsService.deleteSongOnPlaylist(playlistId, songId);

      const response = h.response({
        status: "success",
        message: "Berhasil menghapus lagu di playlist ",
      });
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

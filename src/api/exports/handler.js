const ClientError = require("../../exceptions/ClientError");
class ExportsHandler {
  constructor(exportService, playlistsService, validator) {
    this._exportService = exportService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportPlaylistsHandler =
      this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    try {
      this._validator.validateExportPlaylistsPayload(request.payload);

      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      // Cek apakah apa punya akses terhadap playlist
      // Cek apakah playlist ada
      console.log(playlistId);
      console.log(credentialId);
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      const message = {
        userId: request.auth.credentials.id,
        targetEmail: request.payload.targetEmail,
        playlistId: playlistId,
      };

      await this._exportService.sendMessage({
        queue: "export:playlists",
        message: JSON.stringify(message),
      });

      const response = h.response({
        status: "success",
        message: "Permintaan Anda dalam antrean",
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

module.exports = ExportsHandler;

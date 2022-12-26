const routes = (handler) => [
  {
    method: "POST",
    path: "/playlists/{playlistId}/songs",
    handler: handler.postSongsToPlaylistHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{playlistId}/songs",
    handler: handler.getPlaylistSongsHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
];

module.exports = routes;

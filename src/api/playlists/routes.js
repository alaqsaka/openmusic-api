const routes = (handler) => [
  {
    method: "POST",
    path: "/playlists",
    handler: handler.postPlaylistHandler,
  },
];

module.exports = routes;

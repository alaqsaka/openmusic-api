require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

// albums
const albums = require("./api/albums");
const AlbumsService = require("./services/postgres/AlbumsService");
const AlbumsValidator = require("./validator/album");

// songs
const songs = require("./api/songs");
const SongsService = require("./services/postgres/SongsService");
const SongsValidator = require("./validator/song");

// users
const users = require("./api/users");
const UsersService = require("./services/postgres/UsersService");
const UsersValidator = require("./validator/users");

// playlists
const playlists = require("./api/playlists");
const PlaylistsService = require("./services/postgres/PlaylistsService");
const PlaylistsValidator = require("./validator/playlists");

// authentications
const authentications = require("./api/authentications");
const AuthenticationsService = require("./services/postgres/AuthenticationsService");
const TokenManager = require("./tokenize/TokenManager");
const AuthenticationsValidator = require("./validator/authentications");

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();
  const playlistsService = new PlaylistsService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator,
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  });

  await server.register({
    plugin: users,
    options: {
      service: usersService,
      validator: UsersValidator,
    },
  });

  await server.register({
    plugin: playlists,
    options: {
      service: playlistsService,
      validator: PlaylistsValidator,
    },
  });

  await server.register({
    plugin: authentications,
    options: {
      authenticationsService,
      usersService,
      tokenManager: TokenManager,
      validator: AuthenticationsValidator,
    },
  });

  await server.start();
  console.log("Server berjalan pada ", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();

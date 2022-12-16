const mapDBToModelAlbum = ({ id, name, year, created_at, updated_at }) => ({
  id,
  name,
  year,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapDBToModelSongs = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mapDBToModelSong = ({
  id,
  title,
  performer,
  year,
  genre,
  duration,
  albumId,
}) => ({
  id,
  title,
  performer,
  year,
  genre,
  duration,
  albumId,
});

module.exports = { mapDBToModelAlbum, mapDBToModelSong, mapDBToModelSongs };

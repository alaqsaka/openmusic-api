const fs = require("fs");
const { Pool } = require("pg");

class StorageService {
  constructor(folder) {
    this._folder = folder;
    this._pool = new Pool();

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  async writeFile(file, meta, albumId) {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    // SQL QUERY FOR Input Cover URL
    // yang dimasukin ke database ada 'http://localhost:5000/upload/images/${filename}'
    const filePath = `http://localhost:5000/upload/images/${filename}`;
    const query = {
      text: "UPDATE albums SET cover = $1 WHERE id = $2",
      values: [filePath, albumId],
    };

    const result = await this._pool.query(query);

    return new Promise((resolve, reject) => {
      fileStream.on("error", (error) => reject(error));
      file.pipe(fileStream);
      file.on("end", () => resolve(filename));
    });
  }
}

module.exports = StorageService;

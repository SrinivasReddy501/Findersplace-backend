const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create / open database
const db = new sqlite3.Database(
  path.join(__dirname, "findersplace.db"),
  (err) => {
    if (err) {
      console.error("❌ Error opening database", err.message);
    } else {
      console.log("✅ SQLite database connected");
    }
  }
);

// Create table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      image TEXT,
      contactType TEXT,
      contact TEXT,
      createdAt INTEGER
    )
  `);
});

module.exports = db;

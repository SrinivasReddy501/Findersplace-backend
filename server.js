const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Health check
app.get("/", (req, res) => {
  res.send("FindersPlace API running 🚀");
});

/**
 * POST - Save item
 */
app.post("/api/items", (req, res) => {
  const {
    title,
    description,
    location,
    image,
    contactType,
    contact
  } = req.body;

  if (!title || !contact) {
    return res.status(400).json({ error: "Title and contact are required" });
  }

  const sql = `
    INSERT INTO items 
    (title, description, location, image, contactType, contact, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      title,
      description || "",
      location || "",
      image || "",
      contactType || "email",
      contact,
      Date.now()
    ],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

/**
 * GET - Fetch all items
 */
app.get("/api/items", (req, res) => {
  db.all(
    "SELECT * FROM items ORDER BY createdAt DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

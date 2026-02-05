const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Create table once
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        image TEXT,
        contactType TEXT,
        contact TEXT NOT NULL,
        createdAt BIGINT
      )
    `);
    console.log("✅ Table ready");
  } catch (err) {
    console.error("❌ Table error", err);
  }
})();

// Health check
app.get("/", (req, res) => {
  res.send("FindersPlace API running 🚀");
});

// POST item
app.post("/api/items", async (req, res) => {
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

  try {
    const result = await pool.query(
      `
      INSERT INTO items
      (title, description, location, image, contactType, contact, createdAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [
        title,
        description || "",
        location || "",
        image || "",
        contactType || "email",
        contact,
        Date.now()
      ]
    );

    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET items
app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items ORDER BY createdAt DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

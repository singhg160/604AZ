const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// ✅ TABLE AUTO-CREATION (The "Table Thing")
const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS emissions (
      id SERIAL PRIMARY KEY,
      vehicle_make VARCHAR(100),
      vehicle_model VARCHAR(100),
      vehicle_year INT,
      distance_km FLOAT,
      emission_kg FLOAT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(queryText);
    console.log("✅ Database Table Ready");
  } catch (err) {
    console.error("❌ Table creation failed. Check RDS connection:", err.message);
  }
};

initDb();

// ✅ Health Check for ALB (Root path)
app.get("/", (req, res) => {
  res.status(200).send("ALB Backend is Healthy");
});

// ✅ Health Check for ALB (/health path)
app.get("/health", (req, res) => res.sendStatus(200));

// 🔥 SAVE TO DATABASE
app.post("/carbon", async (req, res) => {
  const { vehicle_make, vehicle_model, vehicle_year, distance_km, emission_kg } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO emissions 
       (vehicle_make, vehicle_model, vehicle_year, distance_km, emission_kg)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [vehicle_make, vehicle_model, vehicle_year, distance_km, emission_kg]
    );

    // Matches your Dashboard.js expectations
    res.json({
      emission_id: result.rows[0].id,
      vehicle_make: result.rows[0].vehicle_make,
      emission_kg: result.rows[0].emission_kg
    });
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Failed to save data" });
  }
});

// Start Server
app.listen(3001, "0.0.0.0", () => {
  console.log("Server running on port 3001");
});

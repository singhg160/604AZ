const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Create DB pool (uses ECS env variables)
const pool = new Pool({
  host: process.env.DB_HOST || "invalid", 
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Gurkirat123!",
  database: process.env.DB_NAME || "carbondb",
  port: 5432,
});

// 🔥 Wait for DB to be ready (VERY IMPORTANT)
const waitForDb = async () => {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Connected to DB");

      // Create table after connection
      await pool.query(`
        CREATE TABLE IF NOT EXISTS emissions (
          id SERIAL PRIMARY KEY,
          vehicle_make VARCHAR(100),
          vehicle_model VARCHAR(100),
          vehicle_year INT,
          distance_km FLOAT,
          emission_kg FLOAT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("✅ Table ready");
      break;

    } catch (err) {
      console.log("⏳ Waiting for DB...", err.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

// Run DB connection in background (DO NOT BLOCK APP)
waitForDb();

// ✅ Health check (ALB uses this)
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

app.get("/health", (req, res) => {
  res.sendStatus(200);
});

// 🔥 Save data (safe DB usage)
app.post("/carbon", async (req, res) => {
  try {
    const {
      vehicle_make,
      vehicle_model,
      vehicle_year,
      distance_km,
      emission_kg
    } = req.body;

    const result = await pool.query(
      `INSERT INTO emissions 
       (vehicle_make, vehicle_model, vehicle_year, distance_km, emission_kg)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        vehicle_make,
        vehicle_model,
        vehicle_year,
        distance_km,
        emission_kg
      ]
    );

    res.json({
      emission_id: result.rows[0].id,
      vehicle_make: result.rows[0].vehicle_make,
      emission_kg: result.rows[0].emission_kg
    });

  } catch (err) {
    console.error("❌ DB ERROR:", err.message);
    res.status(500).json({ error: "Database not ready" });
  }
});

// 🚀 Start server (CRITICAL for ECS)
app.listen(3001, "0.0.0.0", () => {
  console.log("🚀 Server running on port 3001");
});

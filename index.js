const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 DB readiness flag
let isDbReady = false;

// 🔹 Create DB pool
const pool = new Pool({
  host: process.env.DB_HOST || "invalid",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Gurkirat123!",
  database: process.env.DB_NAME || "carbondb",
  port: 5432,
  ssl: {
  rejectUnauthorized: false
}
});

// 🔥 Wait for DB (RETRY LOGIC)
const waitForDb = async () => {
  while (true) {
    try {
      console.log("⏳ Trying to connect to DB...");

      await pool.query("SELECT 1");

      // Create table
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

      console.log("✅ DB connected & table ready");
      isDbReady = true;
      break;

    } catch (err) {
      console.log("❌ DB not ready:", err.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

// Run in background
waitForDb();

// ✅ Health check (ALB uses this)
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

app.get("/health", (req, res) => {
  res.sendStatus(200);
});

// 🔥 Save data
app.post("/carbon", async (req, res) => {
  // 🚨 Prevent crashes when DB not ready
  if (!isDbReady) {
    return res.status(503).json({
      error: "Database is still starting, please try again in a few seconds"
    });
  }

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
      vehicle_model: result.rows[0].vehicle_model,
      emission_kg: result.rows[0].emission_kg
    });

  } catch (err) {
    console.error("❌ DB ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Start server (REQUIRED for ECS)
app.listen(3001, "0.0.0.0", () => {
  console.log("🚀 Server running on port 3001");
});

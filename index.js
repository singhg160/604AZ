const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "carbondb",
  port: 5432,
});

// ✅ Health Check for ALB (Root path)
app.get("/", (req, res) => {
  res.status(200).send("ALB Backend is Healthy");
});

// ✅ Health Check for ALB (/health path)
app.get("/health", (req, res) => res.sendStatus(200));

// 🔥 SAVE TO DATABASE
app.post("/carbon", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "DB not ready" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO emissions 
       (vehicle_make, vehicle_model, vehicle_year, distance_km, emission_kg)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.body.vehicle_make,
        req.body.vehicle_model,
        req.body.vehicle_year,
        req.body.distance_km,
        req.body.emission_kg
      ]
    );

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

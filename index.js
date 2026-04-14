const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,     // AWS will fill this in
  user: process.env.DB_USER,     // AWS will fill this in
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME, 
  port: 5432,
});

// ✅ Health Check for ALB (Root path)
app.get("/", (req, res) => {
  res.status(200).send("ALB Backend is Healthy");
});

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

    // This returns the whole row, including emission_kg and id
    res.json({
  emission_id: result.rows[0].id, // or whatever your PK is
  vehicle_make: result.rows[0].vehicle_make,
  emission_kg: result.rows[0].emission_kg 
});

// Move this OUTSIDE the app.post
app.listen(3001, "0.0.0.0", () => {
  console.log("Server running on port 3001");
});

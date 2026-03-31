// src/components/EmissionChart.js
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function EmissionChart({ data }) {
  return (
    <BarChart width={700} height={350} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="vehicle_model" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="emission_kg" fill="#8884d8" />
    </BarChart>
  );
}

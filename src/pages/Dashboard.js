import React, { useState } from "react";
import axios from "axios";
import EmissionChart from "../components/EmissionChart";

export default function Dashboard() {
  // State for the chart data and UI loading status
  const [emissions, setEmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form input states
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [distanceKm, setDistanceKm] = useState("");

  // Your verified AWS API Gateway URL
  // Replace this URL with your actual Invoke URL from the API Gateway console
  const API_GATEWAY_URL = "https://p3fewq52y3.execute-api.us-east-1.amazonaws.com/carbon-emissions-saver";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. CALCULATION: Logic for CO2 estimation
    const distance = parseFloat(distanceKm);
    const calculatedEmission = (distance * 0.21).toFixed(2);

    const payload = {
      vehicle_make: vehicleMake,
      vehicle_model: vehicleModel,
      vehicle_year: parseInt(vehicleYear),
      distance_km: distance,
      emission_kg: parseFloat(calculatedEmission)
    };

    try {
      // 2. POST TO AWS: Triggers Lambda -> Saves to RDS
      const res = await axios.post(API_GATEWAY_URL, payload);
      
      // 3. UPDATE CHART: Append the new database record to the state
      // We put the newest entry at the front of the array
      setEmissions([res.data, ...emissions]);

      // 4. RESET FORM: Clear inputs for the next entry
      setVehicleMake("");
      setVehicleModel("");
      setVehicleYear("");
      setDistanceKm("");

      console.log("Success: Row saved to RDS with ID:", res.data.emission_id);
    } catch (err) {
      console.error("AWS Error:", err);
      alert("Failed to save to RDS. Ensure CORS is enabled and your API is deployed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#2E7D32", marginBottom: "30px" }}>
        Carbon Tracker: RDS Integrated
      </h2>

      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
        
        {/* INPUT PANEL */}
        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Log Journey</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input 
              style={inputStyle} 
              placeholder="Vehicle Make" 
              value={vehicleMake} 
              onChange={e => setVehicleMake(e.target.value)} 
              required 
            />
            <input 
              style={inputStyle} 
              placeholder="Vehicle Model" 
              value={vehicleModel} 
              onChange={e => setVehicleModel(e.target.value)} 
              required 
            />
            <input 
              style={inputStyle} 
              placeholder="Year" 
              type="number" 
              value={vehicleYear} 
              onChange={e => setVehicleYear(e.target.value)} 
              required 
            />
            <input 
              style={inputStyle} 
              placeholder="Distance (km)" 
              type="number" 
              value={distanceKm} 
              onChange={e => setDistanceKm(e.target.value)} 
              required 
            />
            
            <button 
              type="submit" 
              disabled={loading}
              style={{...buttonStyle, opacity: loading ? 0.7 : 1}}
            >
              {loading ? "Saving to RDS..." : "Calculate & Save"}
            </button>
          </form>
        </div>

        {/* VISUALIZATION PANEL */}
        <div style={{ ...panelStyle, flex: 2, minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {emissions.length > 0 ? (
            <div style={{ width: "100%" }}>
              <h4 style={{ textAlign: "center", color: "#444" }}>
                Latest Result: {emissions[0].vehicle_make} {emissions[0].vehicle_model}
              </h4>
              <div style={{ height: "300px" }}>
                 <EmissionChart data={emissions} />
              </div>
              <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#666" }}>
                Saved in Database as Record #{emissions[0].emission_id}
              </p>
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#999" }}>
              Enter data on the left to generate the carbon emission chart.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline Styles
const panelStyle = { 
  background: "#fff", 
  padding: "25px", 
  borderRadius: "12px", 
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)", 
  border: "1px solid #eee",
  flex: 1 
};

const inputStyle = { 
  padding: "12px", 
  borderRadius: "6px", 
  border: "1px solid #ccc", 
  fontSize: "1rem" 
};

const buttonStyle = { 
  padding: "15px", 
  background: "#2E7D32", 
  color: "#fff", 
  border: "none", 
  borderRadius: "6px", 
  cursor: "pointer", 
  fontWeight: "bold", 
  fontSize: "1rem" 
};
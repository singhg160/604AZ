import { useState } from "react";
import API from "../api";

function CarbonForm({ onSaved }) {
  const [form, setForm] = useState({
    user_id: 1,
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    distance_km: ""
  });

  const submit = async () => {
    const res = await API.post("/calculate", form);
    onSaved(res.data);
  };

  return (
    <div>
      <input placeholder="Make" onChange={e => setForm({...form, vehicle_make: e.target.value})} />
      <input placeholder="Model" onChange={e => setForm({...form, vehicle_model: e.target.value})} />
      <input placeholder="Year" onChange={e => setForm({...form, vehicle_year: e.target.value})} />
      <input placeholder="Distance (km)" onChange={e => setForm({...form, distance_km: e.target.value})} />
      <button onClick={submit}>Calculate & Saved to database</button>
    </div>
  );
}

export default CarbonForm;

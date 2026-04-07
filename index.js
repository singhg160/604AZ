const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.json({
    status: "success",
    message: "Carbon Footprint Backend is Running",
    timestamp: new Date()
  });
});

// Health check route for the Load Balancer
app.get('/health', (req, res) => res.sendStatus(200));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server active on port ${PORT}`);
});

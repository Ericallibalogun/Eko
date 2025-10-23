// Simple test server to verify the environment
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'EKO Navigation Backend Test'
  });
});

app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
});
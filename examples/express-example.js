const express = require('express');
const apiChaosMonkey = require('../index');

const app = express();
app.use(express.json());

// Basic chaos middleware
app.use(apiChaosMonkey({ chaos: 'mild' }));

// Sample routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!', timestamp: new Date().toISOString() });
});

app.get('/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Ankit', role: 'developer' },
      { id: 2, name: 'Chaos Monkey', role: 'troublemaker' }
    ]
  });
});

app.post('/data', (req, res) => {
  res.json({
    received: req.body,
    processed: true,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log('🐒 Chaos Monkey is active with "mild" chaos level');
  console.log('Try making requests to see the chaos in action!');
});
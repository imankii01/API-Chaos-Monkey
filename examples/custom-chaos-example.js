const express = require('express');
const apiChaosMonkey = require('../index');
const { customChaosTypes } = require('../lib/custom-chaos');

const app = express();
app.use(express.json());

// Custom chaos configuration with advanced features
const customConfig = {
  probability: 0.5,
  delayRange: [200, 2000],
  errorCodes: [500, 503],
  chaosWeights: {
    delayWeight: 30,
    errorWeight: 30,
    gibberishWeight: 20
  },
  customChaos: [
    customChaosTypes.memoryLeak,
    customChaosTypes.cpuSpike,
    customChaosTypes.networkJitter
  ],
  logging: true
};

app.use(apiChaosMonkey(customConfig));

// Test endpoints
app.get('/cpu-test', (req, res) => {
  res.json({
    message: 'CPU intensive endpoint',
    calculation: Math.pow(2, 20),
    timestamp: new Date().toISOString()
  });
});

app.get('/memory-test', (req, res) => {
  const largeArray = new Array(10000).fill('test data');
  res.json({
    message: 'Memory intensive endpoint',
    dataSize: largeArray.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/network-test', (req, res) => {
  res.json({
    message: 'Network sensitive endpoint',
    payload: 'A'.repeat(1000), // Large payload
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Custom chaos server running on port ${PORT}`);
  console.log('🐒 Advanced chaos features are active!');
  console.log('   - Memory leak simulation');
  console.log('   - CPU spike simulation');
  console.log('   - Network jitter simulation');
});
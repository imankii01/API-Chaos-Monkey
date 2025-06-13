const express = require('express');
const apiChaosMonkey = require('../index');

const app = express();
app.use(express.json());

// Advanced chaos configuration
const chaosConfig = {
  chaos: 'wild',
  enabledRoutes: ['/api/'], // Only chaos on API routes
  disabledRoutes: ['/health'], // Never chaos on health checks
  timeWindows: [
    { start: '09:00', end: '17:00' } // Only during work hours
  ],
  probability: 0.4,
  delayRange: [500, 5000],
  errorCodes: [500, 503, 502, 429],
  chaosWeights: {
    delayWeight: 40,
    errorWeight: 40,
    gibberishWeight: 20
  },
  logging: true
};

const chaosMonkey = apiChaosMonkey(chaosConfig);
app.use(chaosMonkey);

// Health check route (excluded from chaos)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes (chaos enabled)
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' }
    ]
  });
});

app.get('/api/products', (req, res) => {
  res.json({
    products: [
      { id: 1, name: 'Laptop', price: 999.99 },
      { id: 2, name: 'Mouse', price: 29.99 }
    ]
  });
});

app.post('/api/orders', (req, res) => {
  res.status(201).json({
    order: {
      id: Math.floor(Math.random() * 10000),
      items: req.body.items || [],
      total: req.body.total || 0,
      status: 'created'
    }
  });
});

// Chaos statistics endpoint
app.get('/chaos/stats', (req, res) => {
  // In a real implementation, you'd access the chaos engine instance
  res.json({
    message: 'Chaos statistics endpoint',
    note: 'This would show real chaos statistics in production'
  });
});

// Regular routes (chaos enabled)
app.get('/dashboard', (req, res) => {
  res.json({
    dashboard: {
      totalUsers: 150,
      activeUsers: 42,
      revenue: 15432.50
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Advanced demo server running on port ${PORT}`);
  console.log('🐒 Chaos Monkey is active with advanced configuration');
  console.log('\n📋 Available endpoints:');
  console.log('  GET  /health        - Health check (no chaos)');
  console.log('  GET  /api/users     - Users API (chaos enabled)');
  console.log('  GET  /api/products  - Products API (chaos enabled)');
  console.log('  POST /api/orders    - Orders API (chaos enabled)');
  console.log('  GET  /dashboard     - Dashboard (chaos enabled)');
  console.log('  GET  /chaos/stats   - Chaos statistics');
  console.log('\n⚡ Chaos is only active during configured time windows!');
});
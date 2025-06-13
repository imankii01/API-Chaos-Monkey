const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const apiChaosMonkey = require('../index');

const app = new Koa();
const router = new Router();

app.use(bodyParser());

// Koa chaos middleware
app.use(apiChaosMonkey.koa({ chaos: 'wild' }));

// Routes
router.get('/', (ctx) => {
  ctx.body = {
    message: 'Hello from Koa!',
    framework: 'Koa.js',
    chaos: 'enabled'
  };
});

router.get('/api/data', (ctx) => {
  ctx.body = {
    data: [1, 2, 3, 4, 5],
    timestamp: new Date().toISOString(),
    server: 'Koa with Chaos Monkey'
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Koa server running on port ${PORT}`);
  console.log('🐒 Chaos Monkey is active with "wild" chaos level');
});
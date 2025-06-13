# API Chaos Monkey 🐒💥

![npm version](https://img.shields.io/npm/v/api-chaos-monkey.svg)
![downloads](https://img.shields.io/npm/dt/api-chaos-monkey.svg)
![license](https://img.shields.io/npm/l/api-chaos-monkey.svg)

**Unleash controlled chaos on your Node.js APIs for stress testing and resilience building!**

## 🎯 Problem Statement

Testing APIs under stress is like eating plain oatmeal—boring, predictable, and nobody's idea of a good time. You send a few requests, get some `200 OK`s, and call it a day. But real-world chaos? Unpredictable delays, random failures, garbled data—that's the jungle your API needs to survive! Without a wild shake-up, how do you know your app can handle the madness of production? 🐒💥

## 🚀 Solution

Say hello to **API Chaos Monkey**, a mischievous middleware that turns your Node.js APIs into a playground of pandemonium! Inspired by Netflix's Chaos Monkey, this package randomly delays, drops, or garbles your API responses to simulate the wildest real-world scenarios. It's stress-testing with a side of anarchy—because who said reliability can't be a riot? 🌩️

## 🎪 What It Helps With

- **Stress Testing**: See how your API holds up when the monkey throws wrenches (or bananas) at it
- **Resilience Training**: Prepare your app for network hiccups, server meltdowns, and data disasters
- **Team Entertainment**: Watch your colleagues panic as their perfect code faces the chaos monkey—priceless!
- **Real-World Prep**: Simulate the unpredictable nature of production environments in a fun way

## 🛠️ Technologies Supported

- **Node.js**: Core runtime (v12+ recommended)
- **Express**: Full middleware support
- **Koa**: Native Koa middleware
- **Fastify**: Plugin architecture support
- **Raw HTTP**: Works with any HTTP server
- **Universal**: Runs anywhere Node.js does

## ⚡ Features

- **🕐 Random Delays**: Responses lag anywhere from 1ms to 10s—because timing is everything!
- **💣 Error Bombs**: Drops `500 Internal Server Error`s or other HTTP disasters at random
- **🎭 Gibberish Generator**: Returns mangled JSON to test parsing resilience
- **🎚️ Chaos Levels**: Tune the madness—`mild` for a light shake, `ape-pocalypse` for total mayhem
- **⚙️ Highly Configurable**: Control delay ranges, error rates, and chaos intensity
- **📊 Statistics Tracking**: Monitor chaos impact with detailed metrics
- **⏰ Time Windows**: Schedule chaos for specific hours
- **🎯 Route Filtering**: Target specific endpoints or exclude critical paths
- **🔧 Custom Chaos**: Write your own chaos functions for advanced scenarios

## 📦 Installation

```bash
npm install api-chaos-monkey
```

## 🎮 Quick Start

### Express - Basic Chaos

```javascript
const express = require('express');
const apiChaosMonkey = require('api-chaos-monkey');

const app = express();

// Unleash mild chaos
app.use(apiChaosMonkey({ chaos: 'mild' }));

app.get('/', (req, res) => {
  res.json({ message: 'Survive this!' });
});

app.listen(3000, () => {
  console.log('🐒 Server running with chaos enabled!');
});
```

### Express - Advanced Configuration

```javascript
const express = require('express');
const apiChaosMonkey = require('api-chaos-monkey');

const app = express();

app.use(apiChaosMonkey({
  chaos: 'wild',
  probability: 0.3,                    // 30% chance of chaos
  delayRange: [1000, 5000],           // 1-5 second delays
  errorCodes: [500, 503, 502, 429],   // Various error types
  enabledRoutes: ['/api/'],           // Only chaos on API routes
  disabledRoutes: ['/health'],        // Never chaos health checks
  timeWindows: [                      // Only during work hours
    { start: '09:00', end: '17:00' }
  ],
  chaosWeights: {                     // Control chaos distribution
    delayWeight: 40,
    errorWeight: 40,
    gibberishWeight: 20
  },
  logging: true                       // Enable chaos logging
}));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/users', (req, res) => res.json({ users: [] }));

app.listen(3000);
```

### Koa Support

```javascript
const Koa = require('koa');
const apiChaosMonkey = require('api-chaos-monkey');

const app = new Koa();

app.use(apiChaosMonkey.koa({ chaos: 'wild' }));

app.use(ctx => {
  ctx.body = { message: 'Koa chaos enabled!' };
});

app.listen(3000);
```

### Fastify Support

```javascript
const fastify = require('fastify');
const apiChaosMonkey = require('api-chaos-monkey');

const app = fastify();

app.register(apiChaosMonkey.fastify({ chaos: 'ape-pocalypse' }));

app.get('/', async (request, reply) => {
  return { message: 'Fastify chaos mode!' };
});

app.listen(3000);
```

## 🎪 Chaos Levels

### Built-in Levels

| Level | Probability | Delay Range | Error Codes | Description |
|-------|-------------|-------------|-------------|-------------|
| `mild` | 10% | 100-1000ms | [500] | Gentle chaos for development |
| `wild` | 30% | 500-3000ms | [500,503,502] | Moderate chaos for testing |
| `ape-pocalypse` | 70% | 1-10 seconds | [500,503,502,429,404] | Extreme chaos for stress testing |
| `custom` | 20% | 200-2000ms | [500,503] | Base for custom configurations |

### Custom Configuration

```javascript
const chaosConfig = {
  probability: 0.4,
  delayRange: [500, 8000],
  errorCodes: [500, 503, 502, 429, 404],
  chaosWeights: {
    delayWeight: 30,    // 30% delays
    errorWeight: 50,    // 50% errors  
    gibberishWeight: 20 // 20% gibberish
  },
  enabledRoutes: ['/api/', '/v1/'],
  disabledRoutes: ['/health', '/metrics'],
  timeWindows: [
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '17:00' }
  ],
  logging: true
};

app.use(apiChaosMonkey(chaosConfig));
```

## 🔧 Advanced Features

### Custom Chaos Functions

```javascript
const { createCustomChaos } = require('api-chaos-monkey');

const memoryLeakChaos = createCustomChaos(async (context) => {
  const leak = new Array(100000).fill('CHAOS');
  return {
    type: 'memory-leak',
    message: 'Memory leak induced! 🐒🧠'
  };
});

app.use(apiChaosMonkey({
  customChaos: [memoryLeakChaos]
}));
```

### Statistics Monitoring

```javascript
const chaosMonkey = apiChaosMonkey({ chaos: 'wild' });
const engine = chaosMonkey.chaosEngine;

// Get statistics
setInterval(() => {
  const stats = engine.getStats();
  console.log(`Chaos Stats:`, stats);
}, 10000);

// Listen to chaos events
engine.on('chaos:delay', (data) => {
  console.log(`🐒⏰ Delayed request ${data.chaosId} by ${data.delay}ms`);
});

engine.on('chaos:error', (data) => {
  console.log(`🐒💥 Error ${data.statusCode} for request ${data.chaosId}`);
});
```

## 📊 Example Outputs

### Delayed Response
```json
{
  "message": "Hello World",
  "timestamp": "2025-01-07T10:30:45.123Z"
}
// ↑ Delivered after 3.2 seconds
```

### Error Response
```json
{
  "error": true,
  "message": "Internal Server Error - The monkey broke something! 🐒💥",
  "chaosId": "abc123def",
  "timestamp": "2025-01-07T10:30:45.123Z"
}
```

### Gibberish Response
```json
{
  "chaos": true,
  "message": "OOGA BOOGA",
  "monkeyLevel": 87,
  "bananas": ["CHAOS", "MAYHEM", "HAVOC"],
  "warning": "This response has been monkey-fied! 🐒"
}
```

## 🧪 Testing & Examples

Run the included examples:

```bash
# Basic Express example
npm run example

# Advanced demo with all features
npm run demo

# Run tests
npm test
```

## 🎯 Use Cases

- **Development**: Add controlled chaos to catch edge cases early
- **QA Testing**: Stress test applications without complex setups
- **Load Testing**: Simulate real-world network conditions
- **Team Training**: Practice incident response and debugging
- **Fun**: Prank your colleagues (use responsibly! 😈)

## 🚨 Safety First

- **Never use in production** without careful consideration
- Start with `mild` chaos level and increase gradually
- Always exclude critical endpoints like `/health`
- Use time windows to limit chaos to safe hours
- Monitor your applications closely when chaos is enabled

## 🤝 Contributing

Got a crazier chaos idea? Join the monkey party!

1. Fork the repository
2. Create your chaos branch: `git checkout -b my-chaos-feature`
3. Commit your mayhem: `git commit -am 'Add some chaos'`
4. Push to the branch: `git push origin my-chaos-feature`
5. Submit a pull request

## 📄 License

MIT License - Free to unleash, tweak, and chaos-ify!

## 🙏 Credits

Built with chaos and ❤️ by [Ankit](https://imankit.hashnode.dev/)

Inspired by Netflix's Chaos Monkey and the principles of chaos engineering.

---

**Ready to unleash some havoc? Install API Chaos Monkey and let the mayhem begin! 🐒💣**

*Remember: With great chaos comes great responsibility. Use wisely!*# API-Chaos-Monkey

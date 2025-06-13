const ChaosEngine = require('./lib/chaos-engine');
const middleware = require('./lib/middleware');
const { validateConfig, mergeConfig } = require('./lib/utils');

/**
 * API Chaos Monkey - Unleash controlled chaos on your APIs
 * 
 * @param {Object} options - Configuration options
 * @returns {Function} Middleware function
 */
function apiChaosMonkey(options = {}) {
  const config = mergeConfig(options);
  validateConfig(config);
  
  const chaosEngine = new ChaosEngine(config);
  
  // Return appropriate middleware based on framework detection
  return middleware.createMiddleware(chaosEngine, config);
}

// Export main function and utilities
module.exports = apiChaosMonkey;
module.exports.ChaosEngine = ChaosEngine;
module.exports.chaosLevels = require('./lib/chaos-levels');
module.exports.createCustomChaos = require('./lib/custom-chaos');

// Convenience exports for different frameworks
module.exports.express = (options) => middleware.expressMiddleware(new ChaosEngine(mergeConfig(options)));
module.exports.koa = (options) => middleware.koaMiddleware(new ChaosEngine(mergeConfig(options)));
module.exports.fastify = (options) => middleware.fastifyPlugin(new ChaosEngine(mergeConfig(options)));
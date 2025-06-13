const chaosLevels = require('./chaos-levels');

/**
 * Utility functions for the chaos monkey
 */

/**
 * Simple logger
 */
const logger = {
  debug: (message, ...args) => {
    if (process.env.CHAOS_DEBUG) {
      console.log(`[CHAOS DEBUG] ${message}`, ...args);
    }
  },
  info: (message, ...args) => {
    console.log(`[CHAOS INFO] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[CHAOS WARN] ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[CHAOS ERROR] ${message}`, ...args);
  }
};

/**
 * Generate unique ID for chaos events
 */
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Validate configuration
 */
function validateConfig(config) {
  if (config.probability < 0 || config.probability > 1) {
    throw new Error('Probability must be between 0 and 1');
  }
  
  if (!Array.isArray(config.delayRange) || config.delayRange.length !== 2) {
    throw new Error('DelayRange must be an array of two numbers [min, max]');
  }
  
  if (config.delayRange[0] >= config.delayRange[1]) {
    throw new Error('DelayRange min must be less than max');
  }
  
  if (!Array.isArray(config.errorCodes) || config.errorCodes.length === 0) {
    throw new Error('ErrorCodes must be a non-empty array');
  }
  
  const validErrorCodes = [400, 401, 403, 404, 429, 500, 502, 503, 504];
  const invalidCodes = config.errorCodes.filter(code => !validErrorCodes.includes(code));
  if (invalidCodes.length > 0) {
    logger.warn(`Invalid error codes detected: ${invalidCodes.join(', ')}. Continuing anyway.`);
  }
}

/**
 * Merge user configuration with defaults
 */
function mergeConfig(options = {}) {
  // If a chaos level is specified, use it as base
  let baseConfig = {};
  if (options.chaos && chaosLevels[options.chaos]) {
    baseConfig = { ...chaosLevels[options.chaos] };
  } else {
    // Default configuration
    baseConfig = {
      probability: 0.2,
      delayRange: [100, 2000],
      errorCodes: [500, 503],
      chaosWeights: {
        delayWeight: 60,
        errorWeight: 25,
        gibberishWeight: 15
      },
      enabledRoutes: null,
      disabledRoutes: null,
      timeWindows: null,
      logging: false
    };
  }
  
  // Merge user options
  const config = { ...baseConfig, ...options };
  
  // Ensure chaos weights are normalized
  if (config.chaosWeights) {
    const total = config.chaosWeights.delayWeight + config.chaosWeights.errorWeight + config.chaosWeights.gibberishWeight;
    if (total === 0) {
      config.chaosWeights = baseConfig.chaosWeights;
    }
  }
  
  return config;
}

/**
 * Format chaos statistics for display
 */
function formatStats(stats) {
  const chaosRate = (stats.chaosRate * 100).toFixed(1);
  const uptime = Math.floor(stats.uptime / 1000);
  
  return {
    ...stats,
    chaosRatePercent: `${chaosRate}%`,
    uptimeSeconds: uptime,
    averageDelayMs: Math.round(stats.averageDelay)
  };
}

/**
 * Create a chaos schedule for time-based chaos
 */
function createSchedule(scheduleConfig) {
  const schedule = [];
  
  scheduleConfig.forEach(item => {
    const [hours, minutes] = item.time.split(':').map(Number);
    const triggerTime = new Date();
    triggerTime.setHours(hours, minutes, 0, 0);
    
    schedule.push({
      time: triggerTime,
      chaos: item.chaos,
      duration: item.duration || 3600000 // 1 hour default
    });
  });
  
  return schedule.sort((a, b) => a.time - b.time);
}

module.exports = {
  logger,
  generateId,
  validateConfig,
  mergeConfig,
  formatStats,
  createSchedule
};
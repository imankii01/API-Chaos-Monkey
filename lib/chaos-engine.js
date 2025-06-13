const EventEmitter = require('events');
const chaosLevels = require('./chaos-levels');
const { logger, generateId } = require('./utils');

/**
 * Core Chaos Engine - The heart of the mayhem
 */
class ChaosEngine extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.stats = {
      totalRequests: 0,
      delayedRequests: 0,
      errorRequests: 0,
      gibberishRequests: 0,
      averageDelay: 0,
      startTime: Date.now()
    };
    
    if (this.config.logging) {
      this.setupLogging();
    }
  }

  /**
   * Apply chaos to a request/response cycle
   * @param {Object} context - Request context
   * @returns {Promise<Object>} Chaos result
   */
  async applyChaos(context) {
    const chaosId = generateId();
    this.stats.totalRequests++;
    
    this.emit('chaos:start', { chaosId, context });

    // Skip chaos if conditions aren't met
    if (!this.shouldApplyChaos(context)) {
      this.emit('chaos:skip', { chaosId, reason: 'conditions not met' });
      return { type: 'none', chaosId };
    }

    const chaosType = this.selectChaosType();
    const result = await this.executeChaos(chaosType, context, chaosId);
    
    this.updateStats(result);
    this.emit('chaos:complete', { chaosId, result });
    
    return result;
  }

  /**
   * Determine if chaos should be applied based on conditions
   */
  shouldApplyChaos(context) {
    const { enabledRoutes, disabledRoutes, timeWindows, probability } = this.config;
    
    // Check probability first
    if (Math.random() > probability) return false;
    
    // Check route filters
    if (enabledRoutes && !this.matchesRoutes(context.path, enabledRoutes)) return false;
    if (disabledRoutes && this.matchesRoutes(context.path, disabledRoutes)) return false;
    
    // Check time windows
    if (timeWindows && !this.isInTimeWindow(timeWindows)) return false;
    
    return true;
  }

  /**
   * Select chaos type based on configuration
   */
  selectChaosType() {
    const { delayWeight, errorWeight, gibberishWeight } = this.config.chaosWeights;
    const totalWeight = delayWeight + errorWeight + gibberishWeight;
    const random = Math.random() * totalWeight;
    
    if (random < delayWeight) return 'delay';
    if (random < delayWeight + errorWeight) return 'error';
    return 'gibberish';
  }

  /**
   * Execute the selected chaos type
   */
  async executeChaos(chaosType, context, chaosId) {
    switch (chaosType) {
      case 'delay':
        return await this.applyDelay(context, chaosId);
      case 'error':
        return this.generateError(context, chaosId);
      case 'gibberish':
        return this.generateGibberish(context, chaosId);
      default:
        return { type: 'none', chaosId };
    }
  }

  /**
   * Apply random delay
   */
  async applyDelay(context, chaosId) {
    const [min, max] = this.config.delayRange;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    
    this.emit('chaos:delay', { chaosId, delay });
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      type: 'delay',
      chaosId,
      delay,
      message: `Chaos Monkey delayed response by ${delay}ms 🐒⏰`
    };
  }

  /**
   * Generate random error
   */
  generateError(context, chaosId) {
    const errorCodes = this.config.errorCodes;
    const errorCode = errorCodes[Math.floor(Math.random() * errorCodes.length)];
    
    const errorMessages = {
      500: ['Internal Server Error - The monkey broke something! 🐒💥', 'Server meltdown courtesy of Chaos Monkey!', 'OOPS! The monkey pressed the wrong button!'],
      503: ['Service Unavailable - Monkey is taking a banana break! 🍌', 'The monkeys are on strike!', 'Service temporarily monkeyed with!'],
      502: ['Bad Gateway - The monkey ate the router! 🐒🔌', 'Gateway got monkey-slapped!', 'Network chaos initiated!'],
      429: ['Too Many Requests - The monkey is tired! 😴', 'Rate limit exceeded by monkey business!', 'Slow down, the monkey can\'t keep up!']
    };
    
    const messages = errorMessages[errorCode] || ['Unknown chaos error! 🐒❓'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    this.emit('chaos:error', { chaosId, errorCode, message });
    
    return {
      type: 'error',
      chaosId,
      statusCode: errorCode,
      message,
      error: new Error(message)
    };
  }

  /**
   * Generate gibberish response
   */
  generateGibberish(context, chaosId) {
    const gibberishTypes = ['json', 'text', 'html', 'xml'];
    const gibberishType = gibberishTypes[Math.floor(Math.random() * gibberishTypes.length)];
    
    const gibberish = this.generateGibberishContent(gibberishType);
    
    this.emit('chaos:gibberish', { chaosId, gibberishType, gibberish });
    
    return {
      type: 'gibberish',
      chaosId,
      contentType: this.getContentType(gibberishType),
      content: gibberish,
      message: `Chaos Monkey served gibberish! 🐒🎭`
    };
  }

  /**
   * Generate different types of gibberish content
   */
  generateGibberishContent(type) {
    const monkeyWords = ['OOGA', 'BOOGA', 'BANANA', 'CHAOS', 'MONKEY', 'MAYHEM', 'HAVOC', 'PANDEMONIUM'];
    const randomWord = () => monkeyWords[Math.floor(Math.random() * monkeyWords.length)];
    
    switch (type) {
      case 'json':
        return JSON.stringify({
          chaos: true,
          message: `${randomWord()} ${randomWord()}`,
          monkeyLevel: Math.floor(Math.random() * 100),
          bananas: Array.from({length: Math.floor(Math.random() * 5) + 1}, () => randomWord()),
          timestamp: new Date().toISOString(),
          warning: 'This response has been monkey-fied! 🐒'
        }, null, 2);
      
      case 'html':
        return `<!DOCTYPE html>
<html><head><title>Chaos Monkey Strike!</title></head>
<body style="background: #ff6b6b; color: white; text-align: center; padding: 50px;">
  <h1>🐒 ${randomWord()} ${randomWord()}! 🐒</h1>
  <p>Your request has been monkey-fied!</p>
  <p>Chaos Level: ${Math.floor(Math.random() * 100)}%</p>
</body></html>`;
      
      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<chaos>
  <message>${randomWord()} ${randomWord()}</message>
  <monkey-level>${Math.floor(Math.random() * 100)}</monkey-level>
  <status>MONKEY-FIED</status>
</chaos>`;
      
      default:
        return `${randomWord()} ${randomWord()}! The Chaos Monkey has struck! 🐒💥`;
    }
  }

  /**
   * Get appropriate content type
   */
  getContentType(type) {
    const contentTypes = {
      json: 'application/json',
      html: 'text/html',
      xml: 'application/xml',
      text: 'text/plain'
    };
    return contentTypes[type] || 'text/plain';
  }

  /**
   * Check if path matches route patterns
   */
  matchesRoutes(path, routes) {
    return routes.some(route => {
      if (typeof route === 'string') {
        return path === route || path.startsWith(route);
      }
      return route.test(path);
    });
  }

  /**
   * Check if current time is within allowed windows
   */
  isInTimeWindow(timeWindows) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return timeWindows.some(window => {
      const [startHour, startMin] = window.start.split(':').map(Number);
      const [endHour, endMin] = window.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      return currentTime >= startTime && currentTime <= endTime;
    });
  }

  /**
   * Update statistics
   */
  updateStats(result) {
    switch (result.type) {
      case 'delay':
        this.stats.delayedRequests++;
        this.stats.averageDelay = (this.stats.averageDelay * (this.stats.delayedRequests - 1) + result.delay) / this.stats.delayedRequests;
        break;
      case 'error':
        this.stats.errorRequests++;
        break;
      case 'gibberish':
        this.stats.gibberishRequests++;
        break;
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.startTime,
      chaosRate: this.stats.totalRequests > 0 ? 
        (this.stats.delayedRequests + this.stats.errorRequests + this.stats.gibberishRequests) / this.stats.totalRequests : 0
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      delayedRequests: 0,
      errorRequests: 0,
      gibberishRequests: 0,
      averageDelay: 0,
      startTime: Date.now()
    };
  }

  /**
   * Setup logging if enabled
   */
  setupLogging() {
    this.on('chaos:start', (data) => {
      logger.debug(`Chaos started for request ${data.chaosId}`);
    });
    
    this.on('chaos:delay', (data) => {
      logger.info(`🐒⏰ Chaos Monkey delayed request ${data.chaosId} by ${data.delay}ms`);
    });
    
    this.on('chaos:error', (data) => {
      logger.warn(`🐒💥 Chaos Monkey threw ${data.statusCode} error for request ${data.chaosId}: ${data.message}`);
    });
    
    this.on('chaos:gibberish', (data) => {
      logger.info(`🐒🎭 Chaos Monkey served ${data.gibberishType} gibberish for request ${data.chaosId}`);
    });
  }
}

module.exports = ChaosEngine;
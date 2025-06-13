/**
 * Custom chaos functions for advanced users
 */

/**
 * Create custom chaos function
 * @param {Function} chaosFunction - Custom chaos implementation
 * @param {Object} options - Configuration options
 */
function createCustomChaos(chaosFunction, options = {}) {
  return {
    type: 'custom',
    execute: chaosFunction,
    options: options
  };
}

/**
 * Predefined custom chaos functions
 */
const customChaosTypes = {
  
  /**
   * Memory leak simulator
   */
  memoryLeak: createCustomChaos(async (context) => {
    const leakSize = Math.floor(Math.random() * 1000000) + 100000; // 100KB - 1MB
    const leak = new Array(leakSize).fill('CHAOS_MONKEY_MEMORY_LEAK');
    
    // Keep reference to prevent garbage collection (temporarily)
    setTimeout(() => {
      leak.length = 0; // Clean up after a while
    }, 30000);
    
    return {
      type: 'memory-leak',
      message: `Chaos Monkey created ${(leakSize / 1000).toFixed(1)}KB memory leak 🐒🧠`,
      leakSize
    };
  }),

  /**
   * CPU spike simulator
   */
  cpuSpike: createCustomChaos(async (context) => {
    const duration = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds
    const startTime = Date.now();
    
    // Create CPU-intensive loop
    while (Date.now() - startTime < duration) {
      Math.random() * Math.random(); // Busy work
    }
    
    return {
      type: 'cpu-spike',
      message: `Chaos Monkey caused ${duration}ms CPU spike 🐒💻`,
      duration
    };
  }),

  /**
   * Partial response corruption
   */
  corruptResponse: createCustomChaos(async (context, originalResponse) => {
    if (typeof originalResponse === 'string') {
      const corruptionRate = 0.1; // Corrupt 10% of characters
      const chars = originalResponse.split('');
      
      for (let i = 0; i < chars.length; i++) {
        if (Math.random() < corruptionRate) {
          chars[i] = String.fromCharCode(Math.floor(Math.random() * 126) + 33);
        }
      }
      
      return {
        type: 'corruption',
        content: chars.join(''),
        message: 'Chaos Monkey corrupted response data 🐒🔧'
      };
    }
    
    return { type: 'none' };
  }),

  /**
   * Network jitter simulator
   */
  networkJitter: createCustomChaos(async (context) => {
    const jitterCount = Math.floor(Math.random() * 5) + 2; // 2-6 micro-delays
    
    for (let i = 0; i < jitterCount; i++) {
      const microDelay = Math.floor(Math.random() * 100) + 10; // 10-110ms
      await new Promise(resolve => setTimeout(resolve, microDelay));
    }
    
    return {
      type: 'jitter',
      message: `Chaos Monkey added ${jitterCount} network jitters 🐒📶`,
      jitterCount
    };
  }),

  /**
   * Response size inflator
   */
  inflateResponse: createCustomChaos(async (context, originalResponse) => {
    const inflationSize = Math.floor(Math.random() * 100000) + 10000; // 10KB - 100KB
    const padding = 'CHAOS_MONKEY_PADDING_'.repeat(Math.floor(inflationSize / 20));
    
    if (typeof originalResponse === 'object') {
      return {
        type: 'inflation',
        content: {
          ...originalResponse,
          chaosPadding: padding,
          chaosMessage: 'Response inflated by Chaos Monkey 🐒🎈'
        }
      };
    }
    
    return {
      type: 'inflation',
      content: originalResponse + '\n\n' + padding,
      message: `Chaos Monkey inflated response by ${(inflationSize / 1000).toFixed(1)}KB 🐒🎈`
    };
  }),

  /**
   * Intermittent failure
   */
  intermittentFailure: createCustomChaos(async (context) => {
    const failurePattern = [true, false, true, true, false]; // Pattern of failures
    const index = Date.now() % failurePattern.length;
    
    if (failurePattern[index]) {
      return {
        type: 'intermittent-error',
        statusCode: 503,
        message: 'Intermittent failure - Chaos Monkey is being moody 🐒😤'
      };
    }
    
    return { type: 'none' };
  })
};

module.exports = createCustomChaos;
module.exports.customChaosTypes = customChaosTypes;
/**
 * Predefined chaos levels with different configurations
 */

const chaosLevels = {
  // Gentle chaos for development
  mild: {
    probability: 0.1,
    delayRange: [100, 1000],
    errorCodes: [500],
    chaosWeights: {
      delayWeight: 70,
      errorWeight: 20,
      gibberishWeight: 10
    },
    logging: true
  },

  // Moderate chaos for testing
  wild: {
    probability: 0.3,
    delayRange: [500, 3000],
    errorCodes: [500, 503, 502],
    chaosWeights: {
      delayWeight: 50,
      errorWeight: 30,
      gibberishWeight: 20
    },
    logging: true
  },

  // Extreme chaos for stress testing
  'ape-pocalypse': {
    probability: 0.7,
    delayRange: [1000, 10000],
    errorCodes: [500, 503, 502, 429, 404],
    chaosWeights: {
      delayWeight: 40,
      errorWeight: 40,
      gibberishWeight: 20
    },
    logging: true
  },

  // Custom chaos for fine-tuned control
  custom: {
    probability: 0.2,
    delayRange: [200, 2000],
    errorCodes: [500, 503],
    chaosWeights: {
      delayWeight: 60,
      errorWeight: 25,
      gibberishWeight: 15
    },
    logging: false
  },

  // Chaos for specific scenarios
  weekend: {
    probability: 0.5,
    delayRange: [2000, 8000],
    errorCodes: [503, 502],
    chaosWeights: {
      delayWeight: 30,
      errorWeight: 50,
      gibberishWeight: 20
    },
    timeWindows: [
      { start: '00:00', end: '23:59' }
    ],
    logging: true
  },

  // Network simulation
  network: {
    probability: 0.4,
    delayRange: [3000, 15000],
    errorCodes: [502, 503, 504],
    chaosWeights: {
      delayWeight: 60,
      errorWeight: 35,
      gibberishWeight: 5
    },
    logging: true
  }
};

module.exports = chaosLevels;
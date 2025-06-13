const assert = require('assert');
const ChaosEngine = require('../lib/chaos-engine');
const { validateConfig, mergeConfig } = require('../lib/utils');

// Test configuration validation
function testConfigValidation() {
  console.log('Testing configuration validation...');
  
  // Valid config should not throw
  try {
    validateConfig({
      probability: 0.5,
      delayRange: [100, 2000],
      errorCodes: [500, 503],
      chaosWeights: { delayWeight: 50, errorWeight: 30, gibberishWeight: 20 }
    });
    console.log('✅ Valid config test passed');
  } catch (error) {
    console.error('❌ Valid config test failed:', error.message);
  }
  
  // Invalid probability should throw
  try {
    validateConfig({ probability: 1.5, delayRange: [100, 2000], errorCodes: [500] });
    console.error('❌ Invalid probability test failed - should have thrown');
  } catch (error) {
    console.log('✅ Invalid probability test passed');
  }
  
  // Invalid delay range should throw
  try {
    validateConfig({ probability: 0.5, delayRange: [2000, 100], errorCodes: [500] });
    console.error('❌ Invalid delay range test failed - should have thrown');
  } catch (error) {
    console.log('✅ Invalid delay range test passed');
  }
}

// Test configuration merging
function testConfigMerging() {
  console.log('\nTesting configuration merging...');
  
  const merged = mergeConfig({ chaos: 'mild', probability: 0.8 });
  
  assert(merged.probability === 0.8, 'Custom probability should override default');
  assert(Array.isArray(merged.delayRange), 'Delay range should be inherited from chaos level');
  assert(merged.logging === true, 'Logging should be inherited from mild chaos level');
  
  console.log('✅ Configuration merging tests passed');
}

// Test chaos engine
async function testChaosEngine() {
  console.log('\nTesting Chaos Engine...');
  
  const config = mergeConfig({ chaos: 'mild', probability: 1.0 }); // Force chaos
  const engine = new ChaosEngine(config);
  
  const context = {
    path: '/test',
    method: 'GET',
    headers: {},
    query: {},
    body: {}
  };
  
  // Test chaos application
  const result = await engine.applyChaos(context);
  assert(result.type !== 'none', 'With probability 1.0, chaos should always be applied');
  assert(['delay', 'error', 'gibberish'].includes(result.type), 'Chaos type should be valid');
  
  console.log(`✅ Chaos Engine test passed - applied ${result.type} chaos`);
  
  // Test statistics
  const stats = engine.getStats();
  assert(stats.totalRequests === 1, 'Total requests should be 1');
  assert(stats.chaosRate > 0, 'Chaos rate should be greater than 0');
  
  console.log('✅ Statistics test passed');
}

// Test gibberish generation
async function testGibberishGeneration() {
  console.log('\nTesting gibberish generation...');
  
  const config = mergeConfig({ 
    chaos: 'custom',
    probability: 1.0,
    chaosWeights: { delayWeight: 0, errorWeight: 0, gibberishWeight: 100 }
  });
  const engine = new ChaosEngine(config);
  
  const context = { path: '/test', method: 'GET' };
  const result = await engine.applyChaos(context);
  
  assert(result.type === 'gibberish', 'Should generate gibberish');
  assert(typeof result.content === 'string', 'Gibberish content should be string');
  assert(result.contentType, 'Should have content type');
  
  console.log('✅ Gibberish generation test passed');
}

// Run all tests
async function runTests() {
  console.log('🧪 Running API Chaos Monkey Tests\n');
  
  try {
    testConfigValidation();
    testConfigMerging();
    await testChaosEngine();
    await testGibberishGeneration();
    
    console.log('\n🎉 All tests passed! The Chaos Monkey is ready to cause mayhem! 🐒💥');
  } catch (error) {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
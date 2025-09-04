/**
 * @fileoverview Main Test Runner
 * This script runs all test suites in the correct order
 */

const { spawn } = require('child_process');
const path = require('path');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(testFile, description) {
  return new Promise((resolve, reject) => {
    log(`\n${colors.cyan}🧪 Running: ${description}${colors.reset}`, 'cyan');
    log(`${colors.blue}📁 File: ${testFile}${colors.reset}`, 'blue');
    log(`${'='.repeat(60)}`, 'bright');
    
    const testProcess = spawn('node', [testFile], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        log(`\n${colors.green}✅ ${description} - PASSED${colors.reset}`, 'green');
        resolve();
      } else {
        log(`\n${colors.red}❌ ${description} - FAILED (exit code: ${code})${colors.reset}`, 'red');
        reject(new Error(`Test failed with exit code ${code}`));
      }
    });
    
    testProcess.on('error', (error) => {
      log(`\n${colors.red}❌ ${description} - ERROR: ${error.message}${colors.reset}`, 'red');
      reject(error);
    });
  });
}

async function runAllTests() {
  const startTime = Date.now();
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  log(`\n${colors.bright}🚀 Starting Comprehensive Test Suite${colors.reset}`, 'bright');
  log(`${'='.repeat(60)}`, 'bright');
  
  const testSuites = [
    {
      file: path.join(__dirname, 'lambda', 'test-lambda-local.js'),
      description: 'Lambda Handler Tests'
    },
    {
      file: path.join(__dirname, 'lambda', 'test-oauth2-flow.js'),
      description: 'OAuth2 Flow Tests'
    },
    {
      file: path.join(__dirname, 'lambda', 'test-all.js'),
      description: 'Comprehensive Lambda Tests'
    },
    {
      file: path.join(__dirname, 'localstack', 'test-localstack-simple.js'),
      description: 'LocalStack Deployment Tests'
    },
    {
      file: path.join(__dirname, 'integration', 'test-http-server.js'),
      description: 'HTTP Integration Tests'
    }
  ];
  
  for (const test of testSuites) {
    results.total++;
    try {
      await runTest(test.file, test.description);
      results.passed++;
    } catch (error) {
      results.failed++;
      log(`\n${colors.yellow}⚠️  Continuing with next test...${colors.reset}`, 'yellow');
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`${colors.bright}📊 Test Results Summary${colors.reset}`, 'bright');
  log(`${'='.repeat(60)}`, 'bright');
  log(`Total Tests: ${results.total}`, 'bright');
  log(`Passed: ${colors.green}${results.passed}${colors.reset}`, 'green');
  log(`Failed: ${colors.red}${results.failed}${colors.reset}`, 'red');
  log(`Duration: ${duration}s`, 'bright');
  
  if (results.failed === 0) {
    log(`\n${colors.green}🎉 All tests passed!${colors.reset}`, 'green');
    log(`${colors.green}✅ Lambda function is ready for deployment${colors.reset}`, 'green');
  } else {
    log(`\n${colors.red}❌ Some tests failed${colors.reset}`, 'red');
    log(`${colors.yellow}⚠️  Please review the failed tests before deployment${colors.reset}`, 'yellow');
  }
  
  log(`\n${colors.blue}📋 Test Categories:${colors.reset}`, 'blue');
  log(`  • Lambda Tests: Direct Lambda handler testing`);
  log(`  • OAuth2 Tests: Complete OAuth2 flow simulation`);
  log(`  • LocalStack Tests: AWS service emulation`);
  log(`  • Integration Tests: HTTP server testing`);
  
  log(`\n${colors.blue}🚀 Next Steps:${colors.reset}`, 'blue');
  log(`  • Deploy to AWS Lambda: npm run deploy`);
  log(`  • Use automated deployment: ./deploy.sh`);
  log(`  • Test in production environment`);
  
  process.exit(results.failed === 0 ? 0 : 1);
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  const testType = args[0].toLowerCase();
  
  switch (testType) {
    case 'lambda':
      log(`${colors.blue}Running Lambda tests only...${colors.reset}`, 'blue');
      runTest(path.join(__dirname, 'lambda', 'test-all.js'), 'Lambda Tests');
      break;
    case 'oauth2':
      log(`${colors.blue}Running OAuth2 tests only...${colors.reset}`, 'blue');
      runTest(path.join(__dirname, 'lambda', 'test-oauth2-flow.js'), 'OAuth2 Tests');
      break;
    case 'localstack':
      log(`${colors.blue}Running LocalStack tests only...${colors.reset}`, 'blue');
      runTest(path.join(__dirname, 'localstack', 'test-localstack-simple.js'), 'LocalStack Tests');
      break;
    case 'integration':
      log(`${colors.blue}Running integration tests only...${colors.reset}`, 'blue');
      runTest(path.join(__dirname, 'integration', 'test-http-server.js'), 'Integration Tests');
      break;
    default:
      log(`${colors.red}Unknown test type: ${testType}${colors.reset}`, 'red');
      log(`${colors.yellow}Available types: lambda, oauth2, localstack, integration${colors.reset}`, 'yellow');
      process.exit(1);
  }
} else {
  // Run all tests
  runAllTests().catch((error) => {
    log(`\n${colors.red}❌ Test runner failed: ${error.message}${colors.reset}`, 'red');
    process.exit(1);
  });
}

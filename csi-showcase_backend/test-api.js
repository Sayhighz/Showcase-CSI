#!/usr/bin/env node

/**
 * Script สำหรับทดสอบ API endpoints
 * ใช้สำหรับตรวจสอบว่า API ทำงานได้ถูกต้องหรือไม่
 */

const axios = require('axios');
const colors = require('colors/safe');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:4000/csie/backend2';
const TEST_TIMEOUT = 10000; // 10 seconds

// สร้าง axios instance พร้อม timeout
const api = axios.create({
  baseURL: BASE_URL,
  timeout: TEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Test results
const results = [];

// Helper function to test endpoint
async function testEndpoint(name, method, path, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log(colors.yellow(`Testing: ${name}...`));
    
    const response = await api({
      method,
      url: path,
      ...options
    });
    
    const duration = Date.now() - startTime;
    
    results.push({
      name,
      status: 'PASS',
      statusCode: response.status,
      duration,
      message: `Response in ${duration}ms`
    });
    
    console.log(colors.green(`✓ ${name} - ${response.status} (${duration}ms)`));
    return response.data;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const statusCode = error.response?.status || 0;
    const message = error.response?.data?.message || error.message;
    
    results.push({
      name,
      status: 'FAIL',
      statusCode,
      duration,
      message
    });
    
    console.log(colors.red(`✗ ${name} - ${statusCode || 'ERROR'} (${duration}ms): ${message}`));
    return null;
  }
}

// Main test function
async function runTests() {
  console.log(colors.cyan('\n========================================'));
  console.log(colors.cyan('CSI Showcase Backend API Test'));
  console.log(colors.cyan(`Testing: ${BASE_URL}`));
  console.log(colors.cyan(`Timeout: ${TEST_TIMEOUT}ms`));
  console.log(colors.cyan('========================================\n'));
  
  // Test health endpoints
  console.log(colors.blue('\n--- Health Check Endpoints ---'));
  await testEndpoint('Root Health Check', 'GET', '/health');
  await testEndpoint('API Health Check', 'GET', '/api/health');
  
  // Test main API endpoints
  console.log(colors.blue('\n--- Main API Endpoints ---'));
  await testEndpoint('API Root', 'GET', '/');
  await testEndpoint('API Info', 'GET', '/info');
  
  // Test project endpoints (public)
  console.log(colors.blue('\n--- Project Endpoints (Public) ---'));
  await testEndpoint('Get All Projects', 'GET', '/api/projects/all?page=1&limit=5');
  await testEndpoint('Get Top 9 Projects', 'GET', '/api/projects/top9');
  await testEndpoint('Get Latest Projects', 'GET', '/api/projects/latest?limit=5');
  
  // Test search endpoints
  console.log(colors.blue('\n--- Search Endpoints ---'));
  await testEndpoint('Search Projects', 'GET', '/api/search/projects?keyword=test&limit=5');
  
  // Test Swagger
  console.log(colors.blue('\n--- Documentation ---'));
  await testEndpoint('Swagger UI', 'GET', '/api-docs/');
  
  // Test static file serving
  console.log(colors.blue('\n--- Static Files ---'));
  await testEndpoint('Uploads Directory', 'GET', '/uploads/test.jpg');
  
  // Test error handling
  console.log(colors.blue('\n--- Error Handling ---'));
  await testEndpoint('404 Not Found', 'GET', '/api/nonexistent');
  
  // Test diagnostic endpoint
  console.log(colors.blue('\n--- Diagnostic Endpoints ---'));
  await testEndpoint('Test Top9 Bypass', 'GET', '/api/test-top9-bypass');
  
  // Print summary
  console.log(colors.cyan('\n========================================'));
  console.log(colors.cyan('Test Summary'));
  console.log(colors.cyan('========================================\n'));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`Total Tests: ${results.length}`);
  console.log(colors.green(`Passed: ${passed}`));
  console.log(colors.red(`Failed: ${failed}`));
  console.log(`Total Duration: ${totalDuration}ms`);
  console.log(`Average Response Time: ${Math.round(totalDuration / results.length)}ms`);
  
  // List failed tests
  if (failed > 0) {
    console.log(colors.red('\n--- Failed Tests ---'));
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(colors.red(`✗ ${r.name}: ${r.message}`));
      });
  }
  
  // Check for slow responses
  const slowTests = results.filter(r => r.duration > 5000);
  if (slowTests.length > 0) {
    console.log(colors.yellow('\n--- Slow Tests (>5s) ---'));
    slowTests.forEach(r => {
      console.log(colors.yellow(`⚠ ${r.name}: ${r.duration}ms`));
    });
  }
  
  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error(colors.red('\nUnhandled error:'), error);
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  console.error(colors.red('\nTest execution failed:'), error);
  process.exit(1);
});
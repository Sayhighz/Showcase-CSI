#!/usr/bin/env node

/**
 * Entry point for Passenger/cPanel deployment
 * This file handles the special case where Passenger manages the server
 */

// Set environment to production if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Import the configured Express app
const app = require('./server.js');
const logger = require('./src/config/logger.js');

// Check if running under Passenger
const isPassenger = typeof(PhusionPassenger) !== 'undefined' || 
                   process.env.PASSENGER_APP_ENV || 
                   process.env.IN_PASSENGER;

if (isPassenger) {
  logger.info('Starting app in Passenger environment');
  
  // Configure Passenger if available
  if (typeof(PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
  }
  
  // Export app for Passenger to handle
  module.exports = app;
} else {
  // If not in Passenger, this file shouldn't be used
  logger.warn('app.js called but not in Passenger environment. Use server.js instead.');
  
  // Still export the app
  module.exports = app;
}

// Log startup information
logger.info('App module loaded successfully', {
  environment: process.env.NODE_ENV,
  isPassenger: isPassenger,
  nodeVersion: process.version,
  platform: process.platform,
  pid: process.pid
});

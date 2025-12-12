/**
 * Netlify Serverless Function Wrapper
 * This wraps the Express app for Netlify Functions
 */

const serverless = require('serverless-http');
const app = require('../../api/index.js');

exports.handler = serverless(app);

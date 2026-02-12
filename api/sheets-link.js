/**
 * ADU Dashboard - Google Sheets Link Whitelist API
 * Verifies user email against whitelist before returning Google Sheets link
 */

// Load whitelisted emails from environment variable (VITE_WHITELISTED_EMAILS)
const ALLOWED_EMAILS = (process.env.VITE_WHITELISTED_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(e => e.length > 0);
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk/edit?gid=361465694';

export default function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = request.query;

  if (!email) {
    return response.status(400).json({
      authorized: false,
      message: 'Email parameter required'
    });
  }

  const isAuthorized = ALLOWED_EMAILS.includes(email.toLowerCase());

  if (isAuthorized) {
    return response.status(200).json({
      authorized: true,
      url: SHEETS_URL
    });
  } else {
    return response.status(200).json({
      authorized: false,
      message: 'Access denied.'
    });
  }
}


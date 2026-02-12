/**
 * API Tests for sheets-link endpoint
 * Tests whitelist authorization logic
 */

// Mock handler function - In production, loads from VITE_WHITELISTED_EMAILS
const ALLOWED_EMAILS = ['test@example.com', 'contractor@example.com'];
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk/edit?gid=361465694';

function handler(request, response) {
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

describe('sheets-link API', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      query: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn()
    };
  });

  describe('GET /api/sheets-link', () => {
    test('returns URL for whitelisted email', () => {
      mockRequest.query = { email: 'test@example.com' };

      handler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        authorized: true,
        url: expect.stringContaining('docs.google.com/spreadsheets')
      });
    });

    test('returns URL for whitelisted email: contractor@example.com', () => {
      mockRequest.query = { email: 'contractor@example.com' };

      handler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        authorized: true,
        url: expect.stringContaining('docs.google.com/spreadsheets')
      });
    });

    test('denies access for unauthorized email', () => {
      mockRequest.query = { email: 'unauthorized@example.com' };

      handler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        authorized: false,
        message: 'Access denied.'
      });
    });

    test('is case-insensitive for email check', () => {
      mockRequest.query = { email: 'TEST@EXAMPLE.COM' };

      handler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        authorized: true,
        url: expect.stringContaining('docs.google.com/spreadsheets')
      });
    });

    test('handles missing email parameter', () => {
      mockRequest.query = {};

      handler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        authorized: false,
        message: 'Email parameter required'
      });
    });

    test('rejects non-GET requests', () => {
      mockRequest.method = 'POST';
      mockRequest.query = { email: 'dtle82@gmail.com' };

      handler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(405);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Method not allowed'
      });
    });

    test('handles OPTIONS request for CORS', () => {
      mockRequest.method = 'OPTIONS';

      handler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    test('sets CORS headers', () => {
      mockRequest.query = { email: 'dtle82@gmail.com' };

      handler(mockRequest, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        '*'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods',
        'GET, OPTIONS'
      );
    });
  });
});

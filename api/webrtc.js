// api/webrtc.js
const crypto = require('crypto');

export default function handler(req, res) {
  try {
    // Get origin from request
    const origin = req.headers.origin;

    // Parse allowed origins from environment variable or use defaults
    const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
    const allowedOrigins = allowedOriginsEnv
      ? allowedOriginsEnv.split(',').map(o => o.trim())
      : ['http://localhost:5173'];

    // Check if origin is allowed
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // Set CORS headers - IMPORTANT: Set origin dynamically, not wildcard
    if (isAllowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Validate origin before processing request
    if (!isAllowedOrigin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Origin not allowed'
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: 'Only POST requests are accepted'
      });
    }

    // Validate required environment variables
    const secret = process.env.SECRET_TOKEN;
    const wssEndpoint = process.env.WSS_ENDPOINT;
    const streamEndpoint = process.env.WEBRTC_ENDPOINT;

    if (!secret) {
      console.error('SECRET_TOKEN environment variable is not set');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Server is not properly configured'
      });
    }

    if (!wssEndpoint) {
      console.error('WSS_ENDPOINT environment variable is not set');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'WebSocket endpoint is not configured'
      });
    }

    if (!streamEndpoint) {
      console.error('WEBRTC_ENDPOINT environment variable is not set');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Stream endpoint is not configured'
      });
    }

    // Generate temporary token
    const timestamp = Date.now();
    const expires = timestamp + (5 * 60 * 1000); // 5 minutes

    const token = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}`)
      .digest('hex');

    const wsToken = Buffer.from(JSON.stringify({
      token,
      timestamp,
      expires
    })).toString('base64');

    // Return both endpoints
    return res.status(200).json({
      wss: {
        url: wssEndpoint,
        token: wsToken
      },
      stream: {
        url: streamEndpoint,
        token: wsToken
      },
      expiresAt: expires,
      expiresIn: 300 // seconds
    });

  } catch (error) {
    console.error('Error in webrtc handler:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
}

import crypto from 'crypto';

export default function handler(req, res) {
  try {
    const origin = req.headers.origin;

    const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
    const allowedOrigins = allowedOriginsEnv
      ? allowedOriginsEnv.split(',').map(o => o.trim())
      : ['http://localhost:5173'];

    const isAllowedOrigin = allowedOrigins.includes(origin);

    if (isAllowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (!isAllowedOrigin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Origin not allowed'
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: 'Only POST requests are accepted'
      });
    }

    const secret = process.env.SECRET_TOKEN;
    const streamEndpoint = process.env.WEBRTC_ENDPOINT;

    if (!secret) {
      console.error('SECRET_TOKEN environment variable is not set');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Server is not properly configured'
      });
    }

    if (!streamEndpoint) {
      console.error('WEBRTC_ENDPOINT environment variable is not set');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Stream endpoint is not configured'
      });
    }

    const timestamp = Date.now();
    const expires = timestamp + (5 * 60 * 1000);

    const token = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}`)
      .digest('hex');

    const wsToken = Buffer.from(JSON.stringify({
      token,
      timestamp,
      expires
    })).toString('base64');

    return res.status(200).json({
      stream: {
        url: streamEndpoint,
        token: wsToken
      },
      expiresAt: expires,
      expiresIn: 300
    });

  } catch (error) {
    console.error('Error in webrtc handler:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
}
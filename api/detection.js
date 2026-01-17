// api/detection.js
import crypto from 'crypto';

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
        const detectionWsEndpoint = process.env.DETECTION_WS_ENDPOINT;

        if (!secret) {
            console.error('SECRET_TOKEN environment variable is not set');
            return res.status(500).json({
                error: 'Server Configuration Error',
                message: 'Server is not properly configured'
            });
        }

        if (!detectionWsEndpoint) {
            console.error('DETECTION_WS_ENDPOINT environment variable is not set');
            return res.status(500).json({
                error: 'Server Configuration Error',
                message: 'Detection endpoint is not configured'
            });
        }

        // Generate token
        const timestamp = Date.now();
        const expires = timestamp + (10 * 60 * 1000); // 10 minutes

        const token = crypto
            .createHmac('sha256', secret)
            .update(`detection_${timestamp}`)
            .digest('hex');

        const wsToken = Buffer.from(JSON.stringify({
            token,
            timestamp,
            type: 'detection',
            expires
        })).toString('base64');

        return res.status(200).json({
            url: detectionWsEndpoint,
            token: wsToken,
            expiresAt: expires,
            expiresIn: 600 // seconds
        });

    } catch (error) {
        console.error('Error in detection handler:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }
}
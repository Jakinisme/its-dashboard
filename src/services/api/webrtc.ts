// src/services/api/webrtc.ts

export interface WebRTCEndpoint {
    url: string;
    token: string;
}

export interface WebRTCConfig {
    wss: WebRTCEndpoint;
    stream: WebRTCEndpoint;
    expiresAt: number;
    expiresIn: number;
}

/**
 * WebRTC Service for managing WebSocket signaling and stream endpoints
 */
class WebRTCService {
    private config: WebRTCConfig | null = null;
    private ws: WebSocket | null = null;

    /**
     * Initialize and fetch WebRTC configuration from serverless function
     * @returns Configuration with wss and stream endpoints
     */
    async initialize(): Promise<WebRTCConfig> {
        try {
            // Get endpoints from serverless function
            const response = await fetch('/api/webrtc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Important for CORS with credentials
            });

            const data = await response.json();

            if (!response.ok) {
                // Extract error message from API response
                const errorMessage = data.message || data.error || 'Failed to get WebRTC config';
                throw new Error(errorMessage);
            }

            this.config = data as WebRTCConfig;

            // Validate token hasn't expired
            if (Date.now() > this.config.expiresAt) {
                throw new Error('Config expired before it could be used');
            }

            console.log('WebRTC config initialized. Expires in:', this.config.expiresIn, 'seconds');
            return this.config;

        } catch (error) {
            console.error('Failed to initialize WebRTC config:', error);
            throw error;
        }
    }

    /**
     * Connect to WebSocket signaling server
     * @returns Connected WebSocket instance
     */
    async connectSignaling(): Promise<WebSocket> {
        if (!this.config) {
            await this.initialize();
        }

        const { wss } = this.config!;

        if (!wss || !wss.url || !wss.token) {
            throw new Error('Invalid WebSocket configuration');
        }

        // Connect to WebSocket with token
        this.ws = new WebSocket(`${wss.url}?token=${wss.token}`);

        return new Promise((resolve, reject) => {
            // Set a connection timeout
            const connectionTimeout = setTimeout(() => {
                if (this.ws) {
                    this.ws.close();
                }
                reject(new Error('WebSocket connection timeout (10s)'));
            }, 10000); // 10 seconds timeout

            this.ws!.onopen = () => {
                clearTimeout(connectionTimeout);
                console.log('WebSocket signaling connected to:', wss.url);
                resolve(this.ws!);
            };

            this.ws!.onerror = (error) => {
                clearTimeout(connectionTimeout);
                console.error('WebSocket connection error:', error);
                reject(new Error('WebSocket connection failed'));
            };

            this.ws!.onclose = (event) => {
                console.log('WebSocket closed. Code:', event.code, 'Reason:', event.reason);
            };
        });
    }

    /**
     * Get the stream endpoint URL
     * @returns Stream endpoint URL
     */
    getStreamEndpoint(): string {
        if (!this.config) {
            throw new Error('WebRTC service not initialized. Call initialize() first.');
        }

        if (!this.config.stream || !this.config.stream.url) {
            throw new Error('Stream endpoint not available in configuration');
        }

        return this.config.stream.url;
    }

    /**
     * Get the stream endpoint with token
     * @returns Stream configuration with URL and token
     */
    getStreamConfig(): WebRTCEndpoint {
        if (!this.config) {
            throw new Error('WebRTC service not initialized. Call initialize() first.');
        }

        return this.config.stream;
    }

    /**
     * Check if the configuration is expired or about to expire
     * @param bufferSeconds - Buffer time in seconds (default: 60)
     * @returns True if expired or expiring soon
     */
    isExpiring(bufferSeconds: number = 60): boolean {
        if (!this.config) {
            return true;
        }

        return Date.now() > (this.config.expiresAt - (bufferSeconds * 1000));
    }

    /**
     * Refresh the configuration by re-initializing
     * @returns New configuration
     */
    async refresh(): Promise<WebRTCConfig> {
        console.log('Refreshing WebRTC configuration...');
        this.disconnect();
        return await this.initialize();
    }

    /**
     * Disconnect and cleanup
     */
    disconnect(): void {
        if (this.ws) {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.close(1000, 'Client disconnect');
            }
            this.ws = null;
        }
        this.config = null;
        console.log('WebRTC service disconnected');
    }
}

// Export singleton instance
export const webrtcService = new WebRTCService();

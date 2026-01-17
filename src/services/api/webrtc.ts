export interface WebRTCEndpoint {
    url: string;
    token: string;
}

export interface WebRTCConfig {
    stream: WebRTCEndpoint;
    expiresAt: number;
    expiresIn: number;
}


class WebRTCService {
    private config: WebRTCConfig | null = null;

    async initialize(): Promise<WebRTCConfig> {
        try {
            const response = await fetch('/api/webrtc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Failed to get WebRTC config';
                throw new Error(errorMessage);
            }

            this.config = data as WebRTCConfig;

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

    getStreamEndpoint(): string {
        if (!this.config) {
            throw new Error('WebRTC service not initialized. Call initialize() first.');
        }

        if (!this.config.stream || !this.config.stream.url) {
            throw new Error('Stream endpoint not available in configuration');
        }

        return this.config.stream.url;
    }

    getStreamConfig(): WebRTCEndpoint {
        if (!this.config) {
            throw new Error('WebRTC service not initialized. Call initialize() first.');
        }

        return this.config.stream;
    }

    isExpiring(bufferSeconds: number = 60): boolean {
        if (!this.config) {
            return true;
        }

        return Date.now() > (this.config.expiresAt - (bufferSeconds * 1000));
    }

    async refresh(): Promise<WebRTCConfig> {
        console.log('Refreshing WebRTC configuration...');
        this.disconnect();
        return await this.initialize();
    }

    disconnect(): void {
        this.config = null;
        console.log('WebRTC service disconnected');
    }
}

export const webrtcService = new WebRTCService();

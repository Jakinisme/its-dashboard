// src/services/detectionEndpoint.ts
interface DetectionConfig {
  url: string;
  token: string;
  expiresAt: number;
}

class DetectionEndpointService {
  private config: DetectionConfig | null = null;
  private fetchPromise: Promise<DetectionConfig> | null = null;

  async getConfig(): Promise<DetectionConfig> {
    // Check cache & expiry
    if (this.config && this.config.expiresAt > Date.now() + 60000) { // 1 min buffer
      return this.config;
    }

    // Prevent multiple simultaneous fetches
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.fetchEndpoint();
    
    try {
      this.config = await this.fetchPromise;
      return this.config;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async fetchEndpoint(): Promise<DetectionConfig> {
    console.log('[DetectionService] Fetching endpoint...');
    
    const response = await fetch('/api/detection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get detection endpoint: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DetectionService] Endpoint received, expires at:', new Date(data.expiresAt));
    
    return data;
  }

  clearCache() {
    this.config = null;
    this.fetchPromise = null;
  }
}

export const detectionEndpointService = new DetectionEndpointService();
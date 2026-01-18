
interface DetectionConfig {
  url: string;
  token: string;
  expiresAt: number;
}

class DetectionEndpointService {
  private config: DetectionConfig | null = null;
  private fetchPromise: Promise<DetectionConfig> | null = null;
  private lastFetchTime: number = 0;
  private readonly THROTTLE_MS = 2000;

  async getConfig(): Promise<DetectionConfig> {
    if (this.config && this.config.expiresAt > Date.now() + 60000) {
      return this.config;
    }

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
    const now = Date.now();
    if (now - this.lastFetchTime < this.THROTTLE_MS) {
      throw new Error('Rate limit exceeded: Please wait before retrying detection config');
    }
    this.lastFetchTime = now;

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
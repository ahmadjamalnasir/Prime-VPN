const BASE_URL = 'https://jsonplaceholder.typicode.com'; // Mock API for testing

class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Mock Auth APIs
  async register(userData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { userId: '123', email: userData.email, message: 'Registration successful' };
  }

  async login(credentials) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockToken = 'mock-jwt-token-123';
    this.setToken(mockToken);
    return {
      token: mockToken,
      expiresIn: 86400,
      user: { id: '123', email: credentials.email, subscriptionStatus: 'free' }
    };
  }

  async logout() {
    this.setToken(null);
    return { message: 'Logged out successfully' };
  }

  // Mock Server APIs
  async getServers() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      servers: [
        { id: 'server_1', name: 'New York Premium', country: 'US', city: 'New York', flag_icon: '🇺🇸', ping: 45, load: 65, is_premium: false, server_type: 'standard' },
        { id: 'server_2', name: 'London Fast', country: 'UK', city: 'London', flag_icon: '🇬🇧', ping: 38, load: 78, is_premium: true, server_type: 'premium' }
      ]
    };
  }

  async connectToServer(serverId) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      message: 'Connected successfully',
      connectionId: 'conn_123',
      startTime: new Date().toISOString()
    };
  }

  async getConnectionStatus() {
    return {
      connected: true,
      connectionId: 'conn_123',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      durationSeconds: 3600,
      dataUsageBytes: 10485760,
      routedIp: '203.0.113.45',
      ipCountry: 'US',
      currentSpeedMbps: 30.5,
      serverLoadPercentage: 65,
      pingMs: 45
    };
  }

  async disconnectFromServer() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Disconnected successfully' };
  }

  async getServerStatus() {
    return { connected: false };
  }

  async getUserProfile() {
    return {
      id: '123',
      email: 'user@example.com',
      phone: '1234567890',
      country: 'US',
      subscriptionStatus: 'free',
      subscriptionExpiry: null
    };
  }

  async upgradeSubscription(plan, paymentMethodToken) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      message: 'Subscription upgraded successfully',
      subscriptionStatus: 'premium',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  async getAdConfig() {
    return {
      adProvider: 'GoogleAdMob',
      bannerAdUnitId: 'ca-app-pub-1234567890/banner123',
      intervalSeconds: 120
    };
  }
}

export default new ApiService();

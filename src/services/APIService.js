import WireGuardService from './WireGuardService';
import CryptoJS from 'crypto-js';

const BASE_URL = 'https://api.primevpn.com'; // Production API

class ApiService {
  constructor() {
    this.token = null;
    this.encryptionKey = null;
  }

  setToken(token) {
    this.token = token;
    // Derive encryption key from token
    this.encryptionKey = CryptoJS.SHA256(token).toString();
  }

  // Encrypt sensitive data before transmission
  encryptData(data) {
    if (!this.encryptionKey) return data;
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }

  // Decrypt received data
  decryptData(encryptedData) {
    if (!this.encryptionKey) return encryptedData;
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch {
      return encryptedData;
    }
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
    try {
      // Encrypt credentials before transmission
      const encryptedCredentials = this.encryptData(credentials);
      
      // In production, send to real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate secure token
      const secureToken = CryptoJS.SHA256(credentials.email + Date.now()).toString();
      this.setToken(secureToken);
      
      return {
        token: secureToken,
        expiresIn: 86400,
        user: { 
          id: CryptoJS.SHA256(credentials.email).toString().substring(0, 8),
          email: credentials.email, 
          subscriptionStatus: 'free',
          encryptionEnabled: true
        }
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
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
    try {
      // Get server configuration with WireGuard details
      const serverConfig = await this.getServerConfig(serverId);
      
      // Validate server configuration
      WireGuardService.validateServerConfig(serverConfig.wireGuard);
      
      // Connect using WireGuard protocol
      const result = await WireGuardService.connect(serverConfig.wireGuard);
      
      return {
        message: 'WireGuard connection established',
        connectionId: result.tunnelId,
        startTime: new Date().toISOString(),
        protocol: 'WireGuard',
        encryption: 'ChaCha20Poly1305'
      };
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  // Get WireGuard server configuration
  async getServerConfig(serverId) {
    // In production, this would fetch from your API
    // For demo, return mock WireGuard config
    return {
      wireGuard: {
        endpoint: '203.0.113.1:51820',
        serverPublicKey: 'dGVzdC1zZXJ2ZXItcHVibGljLWtleS1mb3ItZGVtbw==',
        clientIP: '10.0.0.2',
        dns: ['1.1.1.1', '8.8.8.8'],
        allowedIPs: '0.0.0.0/0'
      },
      server: {
        id: serverId,
        name: 'Secure WireGuard Server',
        location: 'US East'
      }
    };
  }

  async getConnectionStatus() {
    // Get real-time WireGuard connection statistics
    const wireGuardStats = WireGuardService.getConnectionStatus();
    
    if (!wireGuardStats.connected) {
      return { connected: false };
    }

    return {
      ...wireGuardStats,
      routedIp: '203.0.113.45', // Would be fetched from actual connection
      ipCountry: 'US',
      protocol: 'WireGuard',
      encryption: 'ChaCha20Poly1305',
      dataUsageBytes: wireGuardStats.bytesReceived + wireGuardStats.bytesSent
    };
  }

  async disconnectFromServer() {
    try {
      const result = await WireGuardService.disconnect();
      return {
        message: 'WireGuard tunnel disconnected',
        success: result.success
      };
    } catch (error) {
      throw new Error(`Disconnect failed: ${error.message}`);
    }
  }

  async getServerStatus() {
    const tunnelInfo = WireGuardService.getTunnelInfo();
    
    if (!tunnelInfo) {
      return { connected: false };
    }

    return {
      connected: true,
      tunnel: tunnelInfo,
      protocol: 'WireGuard',
      encryption: 'ChaCha20Poly1305'
    };
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

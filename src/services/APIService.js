import WireGuardService from './WireGuardService';
import * as Crypto from 'expo-crypto';
import { API_CONFIG, ENDPOINTS } from '../config/api';

const BASE_URL = API_CONFIG.BASE_URL;

class ApiService {
  constructor() {
    this.token = null;
    this.encryptionKey = null;
  }

  async setToken(token) {
    this.token = token;
    // Derive encryption key from token
    this.encryptionKey = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, token);
  }

  // Encrypt sensitive data before transmission (simplified for demo)
  encryptData(data) {
    if (!this.encryptionKey) return data;
    return btoa(JSON.stringify(data) + this.encryptionKey);
  }

  // Decrypt received data (simplified for demo)
  decryptData(encryptedData) {
    if (!this.encryptionKey) return encryptedData;
    try {
      const decoded = atob(encryptedData).replace(this.encryptionKey, '');
      return JSON.parse(decoded);
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

  // Real Auth APIs
  async register(userData) {
    const response = await this.request(ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: {
        name: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        country: userData.countryCode
      }
    });
    return response;
  }

  async verifyEmail(email, otpCode) {
    const response = await this.request(ENDPOINTS.AUTH.VERIFY_EMAIL, {
      method: 'POST',
      body: { email, otp_code: otpCode }
    });
    return response;
  }

  async forgotPassword(email) {
    const response = await this.request(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: { email }
    });
    return response;
  }

  async resetPassword(email, otpCode, newPassword) {
    const response = await this.request(ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: { email, otp_code: otpCode, new_password: newPassword }
    });
    return response;
  }

  async login(credentials) {
    try {
      const response = await this.request(ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password
        }
      });
      
      // Set token for future requests
      await this.setToken(response.access_token);
      
      return {
        token: response.access_token,
        user: {
          id: response.user_id,
          email: credentials.email,
          subscriptionStatus: response.is_premium ? 'premium' : 'free',
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
    const response = await this.request(ENDPOINTS.USER.PROFILE, {
      method: 'GET'
    });
    return response;
  }

  async getUserStatus(userId) {
    const endpoint = ENDPOINTS.USER.STATUS.replace('{userId}', userId);
    const response = await this.request(endpoint, {
      method: 'GET'
    });
    return response;
  }

  async getUserUsage(userId) {
    const endpoint = ENDPOINTS.USER.USAGE.replace('{userId}', userId);
    const response = await this.request(endpoint, {
      method: 'GET'
    });
    return response;
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

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

  validateEndpoint(endpoint) {
    // Validate endpoint starts with / and contains only safe characters
    if (!endpoint.startsWith('/') || !/^[a-zA-Z0-9/_?&=-]+$/.test(endpoint)) {
      throw new Error('Invalid endpoint format');
    }
    return endpoint;
  }

  async request(endpoint, options = {}) {
    const validatedEndpoint = this.validateEndpoint(endpoint);
    const url = `${BASE_URL}${validatedEndpoint}`;
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

  // VPN Server APIs
  async getServers(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const endpoint = queryParams.toString() ? 
      `${ENDPOINTS.VPN.SERVERS}?${queryParams.toString()}` : 
      ENDPOINTS.VPN.SERVERS;
    
    const response = await this.request(endpoint, {
      method: 'GET'
    });
    return response;
  }

  async connectToServer(userId, connectionData) {
    try {
      const queryParams = new URLSearchParams({ user_id: userId });
      const endpoint = `${ENDPOINTS.VPN.CONNECT}?${queryParams.toString()}`;
      
      const response = await this.request(endpoint, {
        method: 'POST',
        body: connectionData
      });
      
          // Use WireGuard config directly from API response
      if (response.wg_config) {
        const serverConfig = this.parseWireGuardConfig(response);
        WireGuardService.validateServerConfig(serverConfig.wireGuard);
        const result = await WireGuardService.connect(serverConfig.wireGuard);
        response.tunnelId = result.tunnelId;
        response.parsedConfig = serverConfig;
      }
      
      return response;
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  // Parse WireGuard config from API response only
  parseWireGuardConfig(connectResponse) {
    return {
      wireGuard: {
        endpoint: connectResponse.server.endpoint,
        serverPublicKey: this.extractPublicKeyFromConfig(connectResponse.wg_config),
        clientIP: connectResponse.client_ip,
        config: connectResponse.wg_config,
        serverConfig: {
          ipAddress: connectResponse.server.ip_address,
          location: connectResponse.server.location
        }
      },
      server: {
        id: connectResponse.server.id,
        name: connectResponse.server.hostname,
        location: connectResponse.server.location,
        ipAddress: connectResponse.server.ip_address
      },
      connectionId: connectResponse.connection_id
    };
  }

  // Extract public key from WireGuard config string
  extractPublicKeyFromConfig(wgConfig) {
    const match = wgConfig.match(/PublicKey\s*=\s*([A-Za-z0-9+/=]+)/i);
    return match ? match[1] : null;
  }

  async getConnectionStatus() {
    // Get real-time WireGuard connection statistics
    const wireGuardStats = WireGuardService.getConnectionStatus();
    
    if (!wireGuardStats.connected) {
      return { connected: false };
    }

    // Get connection data from stored server config
    const tunnelInfo = WireGuardService.getTunnelInfo();
    const serverConfig = tunnelInfo?.serverConfig || {};

    return {
      ...wireGuardStats,
      routedIp: serverConfig.ipAddress || '<ROUTED_IP>',
      ipCountry: serverConfig.location || '<IP_COUNTRY>',
      protocol: process.env.EXPO_PUBLIC_VPN_PROTOCOL || 'WireGuard',
      encryption: process.env.EXPO_PUBLIC_VPN_ENCRYPTION || 'ChaCha20Poly1305',
      dataUsageBytes: wireGuardStats.bytesReceived + wireGuardStats.bytesSent
    };
  }

  async getVpnStatus(userId, connectionId = null) {
    const queryParams = new URLSearchParams({ user_id: userId });
    if (connectionId) {
      queryParams.append('connection_id', connectionId);
    }
    
    const endpoint = `${ENDPOINTS.VPN.STATUS}?${queryParams.toString()}`;
    const response = await this.request(endpoint, {
      method: 'GET'
    });
    return response;
  }

  async disconnectFromServer(connectionId, userId, stats = {}) {
    try {
      const queryParams = new URLSearchParams({
        connection_id: connectionId,
        user_id: userId,
        ...stats
      });
      const endpoint = `${ENDPOINTS.VPN.DISCONNECT}?${queryParams.toString()}`;
      
      const response = await this.request(endpoint, {
        method: 'POST'
      });
      
      // Disconnect WireGuard tunnel
      const result = await WireGuardService.disconnect();
      
      return {
        ...response,
        tunnelDisconnected: result.success
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
      protocol: process.env.EXPO_PUBLIC_VPN_PROTOCOL || 'WireGuard',
      encryption: process.env.EXPO_PUBLIC_VPN_ENCRYPTION || 'ChaCha20Poly1305'
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

  async getSubscriptionPlans() {
    const response = await this.request(ENDPOINTS.SUBSCRIPTIONS.PLANS, {
      method: 'GET'
    });
    return response;
  }

  async getUserSubscription(userId) {
    const endpoint = ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTION.replace('{userId}', userId);
    const response = await this.request(endpoint, {
      method: 'GET'
    });
    return response;
  }

  async cancelSubscription(userId) {
    const endpoint = ENDPOINTS.SUBSCRIPTIONS.CANCEL_SUBSCRIPTION.replace('{userId}', userId);
    const response = await this.request(endpoint, {
      method: 'PATCH'
    });
    return response;
  }

  async getSubscriptionHistory(userId) {
    const endpoint = ENDPOINTS.SUBSCRIPTIONS.SUBSCRIPTION_HISTORY.replace('{userId}', userId);
    const response = await this.request(endpoint, {
      method: 'GET'
    });
    return response;
  }

  async initiatePayment(planId, paymentMethod, amountUsd) {
    const response = await this.request(ENDPOINTS.PAYMENTS.INITIATE, {
      method: 'POST',
      body: {
        plan_id: planId,
        payment_method: paymentMethod,
        amount_usd: amountUsd
      }
    });
    return response;
  }

  async getPaymentStatus(paymentId) {
    const endpoint = ENDPOINTS.PAYMENTS.STATUS.replace('{paymentId}', paymentId);
    const response = await this.request(endpoint, {
      method: 'GET'
    });
    return response;
  }

  async upgradeSubscription(plan, paymentMethodToken) {
    const paymentResponse = await this.initiatePayment(plan.id, paymentMethodToken, plan.price);
    
    // Poll payment status until completion
    let paymentStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      paymentStatus = await this.getPaymentStatus(paymentResponse.id);
    } while (paymentStatus.status === 'pending');
    
    if (paymentStatus.status === 'success') {
      return {
        message: 'Subscription upgraded successfully',
        subscriptionStatus: 'premium',
        paymentId: paymentStatus.id,
        transactionRef: paymentStatus.transaction_ref,
        subscriptionId: paymentStatus.subscription_id
      };
    } else {
      throw new Error('Payment failed');
    }
  }

  async getAdConfig() {
    return {
      adProvider: process.env.EXPO_PUBLIC_AD_PROVIDER || 'GoogleAdMob',
      bannerAdUnitId: process.env.EXPO_PUBLIC_AD_UNIT_ID || '<AD_UNIT_ID>',
      intervalSeconds: parseInt(process.env.EXPO_PUBLIC_AD_INTERVAL, 10) || 120
    };
  }
}

export default new ApiService();

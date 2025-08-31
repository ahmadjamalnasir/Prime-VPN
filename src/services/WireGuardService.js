import { DeviceEventEmitter } from 'react-native';
import * as Crypto from 'expo-crypto';

class WireGuardService {
  constructor() {
    this.isConnected = false;
    this.currentTunnel = null;
    this.connectionStats = null;
    this.eventEmitter = DeviceEventEmitter;
  }

  // Generate WireGuard key pair using Curve25519
  generateKeyPair() {
    const privateKey = this.generatePrivateKey();
    const publicKey = this.derivePublicKey(privateKey);
    return { privateKey, publicKey };
  }

  generatePrivateKey() {
    // Generate 32 random bytes for Curve25519 private key
    const randomBytes = Array.from({length: 32}, () => Math.floor(Math.random() * 256));
    return btoa(String.fromCharCode(...randomBytes));
  }

  async derivePublicKey(privateKey) {
    // In real implementation, use Curve25519 to derive public key
    // For demo, we'll simulate this
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, privateKey);
    return hash.substring(0, 44);
  }

  // Create WireGuard configuration
  createWireGuardConfig(serverConfig, clientKeys) {
    const config = `[Interface]
PrivateKey = ${clientKeys.privateKey}
Address = ${serverConfig.clientIP}/24
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = ${serverConfig.serverPublicKey}
Endpoint = ${serverConfig.endpoint}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;

    return config;
  }

  // Encrypt configuration (simplified for demo)
  encryptConfig(config, password) {
    // In production, use proper AES encryption
    return btoa(config + password);
  }

  // Decrypt configuration (simplified for demo)
  decryptConfig(encryptedConfig, password) {
    // In production, use proper AES decryption
    try {
      return atob(encryptedConfig).replace(password, '');
    } catch {
      throw new Error('Decryption failed');
    }
  }

  // Connect to WireGuard server
  async connect(serverConfig) {
    try {
      // Generate client keys
      const clientKeys = this.generateKeyPair();
      
      // Create WireGuard configuration
      const config = this.createWireGuardConfig(serverConfig, clientKeys);
      
      // Encrypt configuration
      const encryptedConfig = this.encryptConfig(config, 'user-password');
      
      // Simulate WireGuard tunnel creation
      this.currentTunnel = {
        id: `wg-${Date.now()}`,
        config: encryptedConfig,
        serverConfig,
        clientKeys,
        startTime: new Date().toISOString(),
        status: 'connecting'
      };

      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.isConnected = true;
      this.currentTunnel.status = 'connected';
      
      // Start monitoring connection
      this.startConnectionMonitoring();
      
      return {
        success: true,
        tunnelId: this.currentTunnel.id,
        message: 'WireGuard tunnel established'
      };
      
    } catch (error) {
      throw new Error(`WireGuard connection failed: ${error.message}`);
    }
  }

  // Disconnect WireGuard tunnel
  async disconnect() {
    try {
      if (!this.isConnected || !this.currentTunnel) {
        throw new Error('No active tunnel to disconnect');
      }

      // Stop monitoring
      this.stopConnectionMonitoring();
      
      // Simulate tunnel teardown
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isConnected = false;
      this.currentTunnel = null;
      this.connectionStats = null;
      
      return {
        success: true,
        message: 'WireGuard tunnel disconnected'
      };
      
    } catch (error) {
      throw new Error(`Disconnect failed: ${error.message}`);
    }
  }

  // Monitor connection statistics
  startConnectionMonitoring() {
    this.monitoringInterval = setInterval(() => {
      if (this.isConnected && this.currentTunnel) {
        this.updateConnectionStats();
      }
    }, 5000);
  }

  stopConnectionMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  updateConnectionStats() {
    const startTime = new Date(this.currentTunnel.startTime);
    const durationSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
    
    this.connectionStats = {
      connected: true,
      tunnelId: this.currentTunnel.id,
      startTime: this.currentTunnel.startTime,
      durationSeconds,
      bytesReceived: Math.floor(Math.random() * 100000000) + 1000000,
      bytesSent: Math.floor(Math.random() * 50000000) + 500000,
      currentSpeedMbps: Math.floor(Math.random() * 80) + 20,
      serverLoadPercentage: Math.floor(Math.random() * 30) + 40,
      pingMs: Math.floor(Math.random() * 20) + 25,
      protocol: 'WireGuard',
      encryption: 'ChaCha20Poly1305',
      handshakeTime: new Date(Date.now() - Math.random() * 300000).toISOString()
    };
  }

  // Get current connection status
  getConnectionStatus() {
    if (!this.isConnected || !this.currentTunnel) {
      return { connected: false };
    }

    return this.connectionStats || {
      connected: true,
      tunnelId: this.currentTunnel.id,
      status: this.currentTunnel.status
    };
  }

  // Validate server configuration
  validateServerConfig(config) {
    const required = ['endpoint', 'serverPublicKey', 'clientIP'];
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate public key format (Base64, 44 characters)
    if (!/^[A-Za-z0-9+/]{43}=$/.test(config.serverPublicKey)) {
      throw new Error('Invalid server public key format');
    }

    // Validate endpoint format (IP:port or domain:port)
    if (!/^[\w.-]+:\d+$/.test(config.endpoint)) {
      throw new Error('Invalid endpoint format');
    }

    return true;
  }

  // Get tunnel information
  getTunnelInfo() {
    if (!this.currentTunnel) {
      return null;
    }

    return {
      id: this.currentTunnel.id,
      status: this.currentTunnel.status,
      startTime: this.currentTunnel.startTime,
      serverEndpoint: this.currentTunnel.serverConfig.endpoint,
      clientPublicKey: this.currentTunnel.clientKeys.publicKey,
      protocol: 'WireGuard',
      encryption: 'ChaCha20Poly1305'
    };
  }

  // Export configuration for backup
  exportConfig(password) {
    if (!this.currentTunnel) {
      throw new Error('No active tunnel to export');
    }

    const configData = {
      serverConfig: this.currentTunnel.serverConfig,
      clientKeys: this.currentTunnel.clientKeys,
      createdAt: new Date().toISOString()
    };

    return this.encryptConfig(JSON.stringify(configData), password);
  }

  // Import configuration from backup
  importConfig(encryptedData, password) {
    try {
      const decryptedData = this.decryptConfig(encryptedData, password);
      const configData = JSON.parse(decryptedData);
      
      this.validateServerConfig(configData.serverConfig);
      
      return configData;
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error.message}`);
    }
  }
}

export default new WireGuardService();
import RNSimpleWireguard from 'react-native-wireguard-vpn';
import { DeviceEventEmitter, Platform } from 'react-native';
import nacl from 'tweetnacl';
import { encode, decode } from 'tweetnacl-util';

class WireGuardService {
  constructor() {
    this.isConnected = false;
    this.currentTunnel = null;
    this.connectionStats = null;
    this.eventEmitter = DeviceEventEmitter;
  }

  // Initialize the native module
  async initialize() {
    try {
      if (!RNSimpleWireguard) {
        console.warn('WireGuard module not found');
        return false;
      }
      // Initialize if the library requires it (based on index.ts inspection it has initialize method)
      await RNSimpleWireguard.initialize();
      return true;
    } catch (error) {
      console.error('Failed to initialize WireGuard:', error);
      return false;
    }
  }

  // Generate WireGuard key pair using TweetNaCl (Curve25519)
  generateKeyPair() {
    const keyPair = nacl.box.keyPair();
    const publicKey = encode(keyPair.publicKey);
    const privateKey = encode(keyPair.secretKey);
    return { privateKey, publicKey };
  }

  // Connect to WireGuard server
  async connect(serverConfig) {
    try {
      await this.initialize();

      // Generate client keys if not provided
      const clientKeys = this.generateKeyPair();

      const config = {
        privateKey: clientKeys.privateKey,
        publicKey: clientKeys.publicKey, // Library might expect client public key for some reason, or we just log it
        serverAddress: serverConfig.serverConfig.ipAddress,
        serverPort: parseInt(serverConfig.serverConfig.port || '51820', 10),
        allowedIPs: serverConfig.wireGuard.allowedIPs || ['0.0.0.0/0'],
        dns: serverConfig.wireGuard.dns || ['8.8.8.8'],
        mtu: 1280
      };

      // Handle endpoint formatting if needed
      if (serverConfig.wireGuard.endpoint) {
        const [host, port] = serverConfig.wireGuard.endpoint.split(':');
        config.serverAddress = host;
        config.serverPort = parseInt(port, 10);
      }

      // Pass server public key
      config.publicKey = serverConfig.wireGuard.serverPublicKey;

      console.log('Connecting to WireGuard...', { ...config, privateKey: '***' });

      await RNSimpleWireguard.connect(config);

      this.isConnected = true;
      this.currentTunnel = {
        id: `wg-${Date.now()}`,
        clientKeys,
        serverConfig,
        startTime: new Date().toISOString(),
        status: 'connected'
      };

      this.startConnectionMonitoring();

      return {
        success: true,
        tunnelId: this.currentTunnel.id,
        message: 'WireGuard tunnel established'
      };
    } catch (error) {
      console.error('WireGuard connection error:', error);
      throw new Error(`WireGuard connection failed: ${error.message}`);
    }
  }

  // Disconnect WireGuard tunnel
  async disconnect() {
    try {
      await RNSimpleWireguard.disconnect();

      this.stopConnectionMonitoring();
      this.isConnected = false;
      this.currentTunnel = null;
      this.connectionStats = null;

      return {
        success: true,
        message: 'WireGuard tunnel disconnected'
      };
    } catch (error) {
      console.error('WireGuard disconnect error:', error);
      throw new Error(`Disconnect failed: ${error.message}`);
    }
  }

  // Monitor connection statistics
  startConnectionMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      if (this.isConnected) {
        await this.updateConnectionStats();
      }
    }, 5000);
  }

  stopConnectionMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  async updateConnectionStats() {
    try {
      const status = await RNSimpleWireguard.getStatus();

      if (status.tunnelState !== 'ACTIVE' && this.isConnected) {
        // Handle unexpected disconnection
        console.warn('VPN tunnel reported inactive');
        // optionally force disconnect state
      }

      const durationSeconds = this.currentTunnel
        ? Math.floor((Date.now() - new Date(this.currentTunnel.startTime).getTime()) / 1000)
        : 0;

      this.connectionStats = {
        connected: status.isConnected,
        tunnelState: status.tunnelState,
        protocol: 'WireGuard',
        encryption: 'ChaCha20Poly1305',
        startTime: this.currentTunnel?.startTime,
        // Calculated stats
        durationSeconds,
        // Placeholder stats (library doesn't provide them yet)
        dataUsageBytes: 0,
        bytesReceived: 0,
        bytesSent: 0,
        currentSpeedMbps: 0,
        pingMs: 0
      };
    } catch (error) {
      console.warn('Failed to get VPN status:', error);
    }
  }

  // Get current connection status
  getConnectionStatus() {
    return this.connectionStats || { connected: false };
  }

  // Get tunnel information
  getTunnelInfo() {
    if (!this.currentTunnel) return null;
    return {
      id: this.currentTunnel.id,
      status: this.currentTunnel.status,
      startTime: this.currentTunnel.startTime,
      clientPublicKey: this.currentTunnel.clientKeys.publicKey,
      serverEndpoint: this.currentTunnel.serverConfig.wireGuard.endpoint
    };
  }

  // Validate server configuration from API response
  validateServerConfig(config) {
    // Basic validation
    if (!config || !config.endpoint || !config.serverPublicKey) {
      throw new Error('Invalid WireGuard configuration');
    }
    return true;
  }
}

export default new WireGuardService();
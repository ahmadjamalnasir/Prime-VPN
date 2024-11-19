import { WireGuard } from 'react-native-wireguard';
import { api } from './api';

export class VPNService {
  private static instance: VPNService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new VPNService();
    }
    return this.instance;
  }

  async connect(server: Server) {
    try {
      const { config } = await api.get(`/vpn/config/${server.id}`);
      await WireGuard.connect(config);
      return true;
    } catch (error) {
      console.error('VPN connection failed:', error);
      return false;
    }
  }

  async disconnect() {
    try {
      await WireGuard.disconnect();
      return true;
    } catch (error) {
      console.error('VPN disconnection failed:', error);
      return false;
    }
  }
}

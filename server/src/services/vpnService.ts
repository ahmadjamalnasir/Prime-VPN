import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

export const generateConfig = async (userData: any) => {
  const privateKey = execSync('wg genkey').toString().trim();
  const publicKey = execSync(`echo "${privateKey}" | wg pubkey`).toString().trim();
  
  return {
    privateKey,
    publicKey,
    config: `
      [Interface]
      PrivateKey = ${privateKey}
      Address = 10.0.0.2/24
      DNS = 8.8.8.8
      
      [Peer]
      PublicKey = ${process.env.SERVER_PUBLIC_KEY}
      AllowedIPs = 0.0.0.0/0
      Endpoint = ${process.env.SERVER_ENDPOINT}:51820
      PersistentKeepalive = 25
    `
  };
};

export const getServers = async () => {
  return [
    {
      id: 'free-1',
      name: 'Free Server 1',
      location: 'US',
      isPremium: false
    },
    {
      id: 'premium-1',
      name: 'Premium Server 1',
      location: 'EU',
      isPremium: true
    }
  ];
};

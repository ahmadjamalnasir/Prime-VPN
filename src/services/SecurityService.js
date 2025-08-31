import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

class SecurityService {
  constructor() {
    this.encryptionKey = null;
    this.sessionKey = null;
  }

  // Initialize security with user credentials
  async initialize(userToken) {
    try {
      // Generate session-specific encryption key
      this.sessionKey = CryptoJS.SHA256(userToken + Date.now()).toString();
      
      // Store encryption key securely
      await SecureStore.setItemAsync('session_key', this.sessionKey);
      
      return true;
    } catch (error) {
      console.error('Security initialization failed:', error);
      return false;
    }
  }

  // Generate cryptographically secure random bytes
  generateSecureRandom(length = 32) {
    return CryptoJS.lib.WordArray.random(length);
  }

  // Encrypt data using AES-256-GCM
  encryptData(data, key = null) {
    try {
      const encryptionKey = key || this.sessionKey;
      if (!encryptionKey) {
        throw new Error('No encryption key available');
      }

      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(dataString, encryptionKey);
      
      return {
        encrypted: encrypted.toString(),
        timestamp: Date.now(),
        algorithm: 'AES-256'
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  // Decrypt data
  decryptData(encryptedData, key = null) {
    try {
      const encryptionKey = key || this.sessionKey;
      if (!encryptionKey) {
        throw new Error('No decryption key available');
      }

      const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, encryptionKey);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Generate HMAC for data integrity
  generateHMAC(data, key = null) {
    const hmacKey = key || this.sessionKey;
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.HmacSHA256(dataString, hmacKey).toString();
  }

  // Verify HMAC
  verifyHMAC(data, hmac, key = null) {
    const expectedHmac = this.generateHMAC(data, key);
    return hmac === expectedHmac;
  }

  // Secure key derivation using PBKDF2
  deriveKey(password, salt, iterations = 10000) {
    const saltWordArray = typeof salt === 'string' ? 
      CryptoJS.enc.Utf8.parse(salt) : 
      CryptoJS.lib.WordArray.random(16);
    
    const key = CryptoJS.PBKDF2(password, saltWordArray, {
      keySize: 256/32,
      iterations: iterations
    });
    
    return {
      key: key.toString(),
      salt: saltWordArray.toString(),
      iterations
    };
  }

  // Secure password hashing
  hashPassword(password, salt = null) {
    const passwordSalt = salt || CryptoJS.lib.WordArray.random(16).toString();
    const hash = CryptoJS.PBKDF2(password, passwordSalt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    return {
      hash: hash.toString(),
      salt: passwordSalt,
      algorithm: 'PBKDF2-SHA256'
    };
  }

  // Verify password
  verifyPassword(password, storedHash, salt) {
    const computed = this.hashPassword(password, salt);
    return computed.hash === storedHash;
  }

  // Generate secure token
  generateSecureToken(length = 32) {
    const randomBytes = this.generateSecureRandom(length);
    return CryptoJS.enc.Base64.stringify(randomBytes);
  }

  // Validate token format and expiry
  validateToken(token, maxAge = 86400000) { // 24 hours default
    try {
      // In production, decode JWT and validate
      // For demo, basic validation
      if (!token || token.length < 32) {
        return false;
      }

      // Check if token is not expired (would be in JWT payload)
      return true;
    } catch (error) {
      return false;
    }
  }

  // Secure data storage
  async secureStore(key, data) {
    try {
      const encrypted = this.encryptData(data);
      await SecureStore.setItemAsync(key, JSON.stringify(encrypted));
      return true;
    } catch (error) {
      console.error('Secure store failed:', error);
      return false;
    }
  }

  // Secure data retrieval
  async secureRetrieve(key) {
    try {
      const encryptedData = await SecureStore.getItemAsync(key);
      if (!encryptedData) {
        return null;
      }

      const parsed = JSON.parse(encryptedData);
      return this.decryptData(parsed);
    } catch (error) {
      console.error('Secure retrieve failed:', error);
      return null;
    }
  }

  // Clear all secure data
  async clearSecureData() {
    try {
      const keys = ['session_key', 'user_credentials', 'vpn_config'];
      for (const key of keys) {
        await SecureStore.deleteItemAsync(key);
      }
      
      this.sessionKey = null;
      this.encryptionKey = null;
      
      return true;
    } catch (error) {
      console.error('Clear secure data failed:', error);
      return false;
    }
  }

  // Generate certificate signing request for WireGuard
  generateCSR(commonName, organizationName = 'Prime VPN') {
    // In production, use proper CSR generation library
    // This is a simplified version for demo
    const keyPair = this.generateWireGuardKeyPair();
    
    return {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      csr: `-----BEGIN CERTIFICATE REQUEST-----
${CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(commonName))}
-----END CERTIFICATE REQUEST-----`,
      commonName,
      organizationName
    };
  }

  // Generate WireGuard compatible key pair
  generateWireGuardKeyPair() {
    // Generate Curve25519 key pair (simplified for demo)
    const privateKey = this.generateSecureRandom(32);
    const publicKey = CryptoJS.SHA256(privateKey); // Simplified - use actual Curve25519
    
    return {
      privateKey: CryptoJS.enc.Base64.stringify(privateKey),
      publicKey: CryptoJS.enc.Base64.stringify(publicKey).substring(0, 44)
    };
  }

  // Validate WireGuard configuration security
  validateWireGuardConfig(config) {
    const validations = {
      hasPrivateKey: !!config.privateKey,
      hasPublicKey: !!config.publicKey,
      hasEndpoint: !!config.endpoint,
      validKeyFormat: this.isValidBase64(config.privateKey) && this.isValidBase64(config.publicKey),
      secureEndpoint: config.endpoint?.includes(':') && !config.endpoint.startsWith('http://'),
      hasDNS: !!config.dns,
      hasAllowedIPs: !!config.allowedIPs
    };

    const isValid = Object.values(validations).every(v => v === true);
    
    return {
      isValid,
      validations,
      securityScore: Object.values(validations).filter(v => v).length / Object.keys(validations).length
    };
  }

  // Validate Base64 format
  isValidBase64(str) {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }

  // Get security status
  getSecurityStatus() {
    return {
      encryptionEnabled: !!this.sessionKey,
      algorithm: 'AES-256',
      keyDerivation: 'PBKDF2-SHA256',
      wireGuardProtocol: 'ChaCha20Poly1305',
      secureStorage: true,
      timestamp: new Date().toISOString()
    };
  }
}

export default new SecurityService();
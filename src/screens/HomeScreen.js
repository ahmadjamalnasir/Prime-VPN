import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect from 'react-native-picker-select';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { 
    user, 
    currentConnection, 
    connectionStats, 
    connectToServer, 
    disconnectFromServer, 
    updateConnectionStats,
    loading 
  } = useApp();
  const [selectedServer, setSelectedServer] = useState('auto');
  const isPremium = user?.subscriptionStatus === 'premium';
  const isConnected = !!currentConnection;

  const servers = [
    { label: 'Auto (Best Server)', value: 'auto' },
    { label: 'United States', value: 'us' },
    { label: 'United Kingdom', value: 'uk' },
    { label: 'Germany', value: 'de' },
    { label: 'Japan', value: 'jp' },
    { label: 'Singapore', value: 'sg' },
  ];

  const handleConnect = async () => {
    if (isConnected) {
      try {
        await disconnectFromServer();
      } catch (error) {
        Alert.alert('Disconnect Failed', error.message);
      }
    } else {
      if (!isPremium && selectedServer !== 'auto') {
        Alert.alert(
          'Premium Feature',
          'Server selection is only available for premium users. Upgrade to access all servers!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => navigation.navigate('Payment') }
          ]
        );
        return;
      }

      try {
        await connectToServer('server_1'); // Default server
      } catch (error) {
        Alert.alert('Connection Failed', error.message);
      }
    }
  };

  const getStatusColor = () => {
    if (loading) return '#ffaa00';
    return isConnected ? '#00ff88' : '#ff4757';
  };

  const getStatusText = () => {
    if (loading) return 'Connecting...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Connection status polling
  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => {
        updateConnectionStats();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isConnected, updateConnectionStats]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
              {!isPremium && (
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => navigation.navigate('Payment')}
                >
                  <Text style={styles.upgradeText}>Upgrade</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Current Server Display */}
          {isConnected && connectionStats && (
            <View style={styles.serverInfoContainer}>
              <View style={styles.serverInfo}>
                <Text style={styles.serverFlag}>🇺🇸</Text>
                <View style={styles.serverDetails}>
                  <Text style={styles.serverName}>{connectionStats.ipCountry || 'Connected'}</Text>
                  <Text style={styles.serverPing}>Ping: {connectionStats.pingMs}ms</Text>
                </View>
                <View style={styles.speedInfo}>
                  <Text style={styles.speedText}>↓ {connectionStats.currentSpeedMbps} Mbps</Text>
                  <Text style={styles.speedText}>IP: {connectionStats.routedIp}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Main Connect Button */}
          <View style={styles.connectContainer}>
            <TouchableOpacity 
              style={[styles.connectButton, loading && styles.disabledButton]} 
              onPress={handleConnect}
              activeOpacity={0.8}
              disabled={loading}
            >
              <LinearGradient
                colors={isConnected ? ['#ff4757', '#ff3742'] : ['#00ff88', '#00cc6a']}
                style={styles.connectGradient}
              >
                {loading ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <Text style={styles.connectText}>
                    {isConnected ? 'DISCONNECT' : 'CONNECT'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Server Selection */}
          <View style={styles.serverContainer}>
            <Text style={styles.sectionTitle}>Select Server</Text>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                value={selectedServer}
                onValueChange={(value) => setSelectedServer(value)}
                items={servers}
                style={pickerSelectStyles}
                placeholder={{ label: 'Select a server...', value: null }}
                disabled={!isPremium}
              />
              {!isPremium && (
                <View style={styles.premiumOverlay}>
                  <Text style={styles.premiumText}>Premium Only</Text>
                </View>
              )}
            </View>
          </View>

          {/* Connection Statistics */}
          {isConnected && connectionStats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Session Time</Text>
                <Text style={styles.statValue}>{formatDuration(connectionStats.durationSeconds)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Data Used</Text>
                <Text style={styles.statValue}>{formatBytes(connectionStats.dataUsageBytes)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Server Load</Text>
                <Text style={styles.statValue}>{connectionStats.serverLoadPercentage}%</Text>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ServerList')}
            >
              <Text style={styles.actionIcon}>🌐</Text>
              <Text style={styles.actionButtonText}>Servers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Favorites', 'Favorites feature coming soon')}
            >
              <Text style={styles.actionIcon}>⭐</Text>
              <Text style={styles.actionButtonText}>Favorites</Text>
            </TouchableOpacity>
            
            {!isPremium && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Payment')}
              >
                <Text style={styles.actionIcon}>👑</Text>
                <Text style={styles.actionButtonText}>Premium</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Ad Banner for Free Users */}
          {!isPremium && (
            <View style={styles.adContainer}>
              <View style={styles.adBanner}>
                <Text style={styles.adText}>Advertisement</Text>
                <Text style={styles.adSubText}>Upgrade to remove ads</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileIcon: {
    fontSize: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#ffaa00',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  connectContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  connectButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  connectGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  serverContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  pickerContainer: {
    position: 'relative',
  },
  premiumOverlay: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: '#ffaa00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  serverInfoContainer: {
    marginBottom: 20,
  },
  serverInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  serverFlag: {
    fontSize: 30,
    marginRight: 15,
  },
  serverDetails: {
    flex: 1,
  },
  serverName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  serverPing: {
    color: '#00ff88',
    fontSize: 14,
  },
  speedInfo: {
    alignItems: 'flex-end',
  },
  speedText: {
    color: '#8a8a8a',
    fontSize: 12,
    marginBottom: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#8a8a8a',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  adContainer: {
    marginTop: 20,
  },
  adBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  adText: {
    color: '#8a8a8a',
    fontSize: 14,
  },
  adSubText: {
    color: '#00ff88',
    fontSize: 12,
    marginTop: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeholder: {
    color: '#8a8a8a',
  },
});

export default HomeScreen;

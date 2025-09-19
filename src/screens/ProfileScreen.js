import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import ApiService from '../services/ApiService';

const ProfileScreen = ({ navigation }) => {
  const { user: contextUser, logout } = useApp();
  const [userProfile, setUserProfile] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [userUsage, setUserUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profile, status, usage] = await Promise.all([
        ApiService.getUserProfile(),
        contextUser?.user_id ? ApiService.getUserStatus(contextUser.user_id) : null,
        contextUser?.user_id ? ApiService.getUserUsage(contextUser.user_id) : null,
      ]);
      setUserProfile(profile);
      setUserStatus(status);
      setUserUsage(usage);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const user = userProfile || contextUser || {
    name: 'User',
    email: 'user@example.com',
    is_premium: false,
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          await logout();
          navigation.replace('Login');
        }}
      ]
    );
  };

  const handleUpgrade = () => {
    navigation.navigate('Payment');
  };

  const menuItems = [
    { title: 'Subscription Management', icon: '💳', onPress: () => navigation.navigate('Subscription') },
    { title: 'Account Settings', icon: '⚙️', onPress: () => Alert.alert('Settings', 'Account settings coming soon') },
    { title: 'Privacy Policy', icon: '🔒', onPress: () => Alert.alert('Privacy', 'Privacy policy coming soon') },
    { title: 'Terms of Service', icon: '📄', onPress: () => Alert.alert('Terms', 'Terms of service coming soon') },
    { title: 'Help & Support', icon: '❓', onPress: () => Alert.alert('Support', 'Help & support coming soon') },
    { title: 'Rate App', icon: '⭐', onPress: () => Alert.alert('Rate', 'Rate app coming soon') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ff88" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : (
            <>
              {/* User Info Section */}
              <View style={styles.userSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {(user.name || 'U').split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.editAvatarButton}>
                    <Text style={styles.editAvatarText}>📷</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.userName}>{user.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.phone && (
                  <Text style={styles.userPhone}>{user.phone}</Text>
                )}
              </View>

              {/* Usage Stats */}
              {userUsage && (
                <View style={styles.usageSection}>
                  <Text style={styles.sectionTitle}>Usage Statistics</Text>
                  <View style={styles.usageGrid}>
                    <View style={styles.usageItem}>
                      <Text style={styles.usageValue}>{(userUsage.total_data_mb / 1024).toFixed(1)}GB</Text>
                      <Text style={styles.usageLabel}>Total Data</Text>
                    </View>
                    <View style={styles.usageItem}>
                      <Text style={styles.usageValue}>{userUsage.total_connections}</Text>
                      <Text style={styles.usageLabel}>Connections</Text>
                    </View>
                    <View style={styles.usageItem}>
                      <Text style={styles.usageValue}>{(userUsage.current_month_data_mb / 1024).toFixed(1)}GB</Text>
                      <Text style={styles.usageLabel}>This Month</Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Subscription Status */}
          <View style={styles.subscriptionSection}>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <Text style={styles.subscriptionTitle}>Subscription Status</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: user.is_premium ? '#00ff88' : '#ffaa00' }
                ]}>
                  <Text style={styles.statusText}>{user.is_premium ? 'Premium' : 'Free'}</Text>
                </View>
              </View>
              
              {userStatus && userStatus.days_remaining && (
                <Text style={styles.daysRemaining}>
                  {userStatus.days_remaining} days remaining
                </Text>
              )}
              
              {user.is_premium ? (
                <View>
                  <Text style={styles.subscriptionDetails}>
                    Premium features active
                  </Text>
                  <Text style={styles.expiryText}>
                    Expires: {user.subscriptionExpiry || 'Never'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.manageButton}
                    onPress={() => navigation.navigate('Subscription')}
                  >
                    <Text style={styles.manageButtonText}>Manage Subscription</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.subscriptionDetails}>
                    Limited to 1 server • Ads included
                  </Text>
                  <TouchableOpacity 
                    style={styles.upgradeButton}
                    onPress={handleUpgrade}
                  >
                    <LinearGradient
                      colors={['#00ff88', '#00cc6a']}
                      style={styles.upgradeGradient}
                    >
                      <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Prime VPN v1.0.0</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { paddingTop: 10, marginBottom: 30 },
  backButton: { marginBottom: 20 },
  backText: { color: '#00ff88', fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  
  userSection: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  avatarText: { fontSize: 36, color: '#00ff88', fontWeight: 'bold' },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00ff88',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarText: { fontSize: 16 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  userEmail: { fontSize: 16, color: '#8a8a8a' },
  
  subscriptionSection: { marginBottom: 30 },
  subscriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  subscriptionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  subscriptionDetails: { color: '#8a8a8a', fontSize: 14, marginBottom: 10 },
  expiryText: { color: '#8a8a8a', fontSize: 12 },
  upgradeButton: { borderRadius: 12, marginTop: 10 },
  upgradeGradient: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  upgradeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  manageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  manageButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  menuSection: { marginBottom: 30 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { fontSize: 20, marginRight: 15 },
  menuTitle: { fontSize: 16, color: '#fff', fontWeight: '500' },
  menuArrow: { fontSize: 20, color: '#8a8a8a' },
  
  logoutButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4757',
    marginBottom: 20,
  },
  logoutText: { color: '#ff4757', fontSize: 16, fontWeight: 'bold' },
  
  versionContainer: { alignItems: 'center' },
  versionText: { color: '#8a8a8a', fontSize: 12 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
  userPhone: { fontSize: 14, color: '#8a8a8a', marginTop: 5 },
  
  usageSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  usageGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  usageItem: { alignItems: 'center' },
  usageValue: { fontSize: 20, fontWeight: 'bold', color: '#00ff88' },
  usageLabel: { fontSize: 12, color: '#8a8a8a', marginTop: 5 },
  daysRemaining: { color: '#ffaa00', fontSize: 14, marginBottom: 10, fontWeight: 'bold' },
});

export default ProfileScreen;
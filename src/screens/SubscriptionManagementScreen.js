import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import ApiService from '../services/ApiService';

const SubscriptionManagementScreen = ({ navigation }) => {
  const { user } = useApp();
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const userId = user?.user_id || user?.id;
      const [subData, historyData] = await Promise.all([
        ApiService.getUserSubscription(userId),
        ApiService.getSubscriptionHistory(userId)
      ]);
      setSubscription(subData);
      setHistory(historyData.history || historyData);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive',
          onPress: confirmCancellation
        }
      ]
    );
  };

  const confirmCancellation = async () => {
    try {
      const userId = user?.user_id || user?.id;
      await ApiService.cancelSubscription(userId);
      Alert.alert('Success', 'Subscription cancelled successfully. You will retain access until the end of your billing period.');
      fetchSubscriptionData(); // Refresh data
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel subscription');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderHistoryItem = (item, index) => (
    <View key={index} style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyPlan}>{item.plan_name}</Text>
        <Text style={styles.historyAmount}>{item.amount}</Text>
      </View>
      <Text style={styles.historyDate}>
        {formatDate(item.created_at)} - {item.status}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ff88" />
            <Text style={styles.loadingText}>Loading subscription...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Active Subscription */}
          {subscription ? (
            <View style={styles.subscriptionCard}>
              <Text style={styles.sectionTitle}>Active Subscription</Text>
              <View style={styles.subscriptionDetails}>
                <Text style={styles.planName}>{subscription.plan_name}</Text>
                <Text style={styles.planPrice}>{subscription.amount}</Text>
                <Text style={styles.planStatus}>Status: {subscription.status}</Text>
                <Text style={styles.planExpiry}>
                  Expires: {formatDate(subscription.expires_at)}
                </Text>
                {subscription.auto_renew && (
                  <Text style={styles.autoRenew}>Auto-renewal enabled</Text>
                )}
              </View>
              
              {subscription.status === 'active' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelSubscription}
                >
                  <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noSubscriptionCard}>
              <Text style={styles.noSubscriptionText}>No active subscription</Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.navigate('SubscriptionPlans')}
              >
                <LinearGradient
                  colors={['#00ff88', '#00cc6a']}
                  style={styles.upgradeGradient}
                >
                  <Text style={styles.upgradeButtonText}>View Plans</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Subscription History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Subscription History</Text>
            {history.length > 0 ? (
              history.map(renderHistoryItem)
            ) : (
              <Text style={styles.noHistoryText}>No subscription history</Text>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backText: { color: '#00ff88', fontSize: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 20 },
  scrollContent: { padding: 20 },
  
  subscriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  subscriptionDetails: { marginBottom: 20 },
  planName: { fontSize: 24, fontWeight: 'bold', color: '#00ff88', marginBottom: 5 },
  planPrice: { fontSize: 20, color: '#fff', marginBottom: 10 },
  planStatus: { fontSize: 16, color: '#8a8a8a', marginBottom: 5 },
  planExpiry: { fontSize: 16, color: '#8a8a8a', marginBottom: 5 },
  autoRenew: { fontSize: 14, color: '#ffaa00' },
  
  cancelButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  cancelButtonText: { color: '#ff4757', fontSize: 16, fontWeight: 'bold' },
  
  noSubscriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  noSubscriptionText: { fontSize: 18, color: '#8a8a8a', marginBottom: 20 },
  upgradeButton: { borderRadius: 12 },
  upgradeGradient: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, alignItems: 'center' },
  upgradeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  historySection: { marginTop: 20 },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  historyPlan: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  historyAmount: { fontSize: 16, color: '#00ff88' },
  historyDate: { fontSize: 14, color: '#8a8a8a' },
  noHistoryText: { fontSize: 16, color: '#8a8a8a', textAlign: 'center', marginTop: 20 },
});

export default SubscriptionManagementScreen;
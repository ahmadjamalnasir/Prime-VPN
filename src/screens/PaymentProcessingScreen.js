import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../services/ApiService';

const PaymentProcessingScreen = ({ navigation, route }) => {
  const { plan, paymentMethod } = route.params;
  const [paymentId, setPaymentId] = useState(null);
  const [status, setStatus] = useState('initiating');
  const [statusMessage, setStatusMessage] = useState('Initiating payment...');

  useEffect(() => {
    initiatePayment();
  }, []);

  useEffect(() => {
    if (paymentId && status === 'pending') {
      const interval = setInterval(checkPaymentStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [paymentId, status]);

  const initiatePayment = async () => {
    try {
      const response = await ApiService.initiatePayment(
        plan.id,
        paymentMethod,
        plan.amount_usd || parseFloat(plan.price.replace('$', ''))
      );
      
      setPaymentId(response.payment_id);
      setStatus('pending');
      setStatusMessage('Processing payment...');
      
      // In real implementation, redirect to payment provider
      if (response.payment_url) {
        // Linking.openURL(response.payment_url);
      }
    } catch (error) {
      setStatus('failed');
      setStatusMessage('Payment initiation failed');
      Alert.alert('Error', error.message);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await ApiService.getPaymentStatus(paymentId);
      
      if (response.status === 'completed') {
        setStatus('success');
        setStatusMessage('Payment successful!');
        setTimeout(() => {
          Alert.alert('Success', 'Subscription activated successfully!', [
            { text: 'OK', onPress: () => navigation.navigate('Profile') }
          ]);
        }, 1000);
      } else if (response.status === 'failed') {
        setStatus('failed');
        setStatusMessage('Payment failed');
        Alert.alert('Payment Failed', 'Please try again or contact support');
      }
    } catch (error) {
      console.error('Payment status check failed:', error);
    }
  };

  const handleRetry = () => {
    setStatus('initiating');
    setStatusMessage('Initiating payment...');
    setPaymentId(null);
    initiatePayment();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'initiating':
      case 'pending':
        return '⏳';
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#00ff88';
      case 'failed':
        return '#ff4757';
      default:
        return '#ffaa00';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusIcon, { color: getStatusColor() }]}>
              {getStatusIcon()}
            </Text>
            <Text style={styles.statusTitle}>{statusMessage}</Text>
            
            <View style={styles.planDetails}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.paymentMethod}>via {paymentMethod}</Text>
            </View>

            {(status === 'initiating' || status === 'pending') && (
              <ActivityIndicator size="large" color="#00ff88" style={styles.loader} />
            )}

            {status === 'failed' && (
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <LinearGradient
                  colors={['#00ff88', '#00cc6a']}
                  style={styles.retryGradient}
                >
                  <Text style={styles.retryButtonText}>Retry Payment</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {status === 'success' && (
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={() => navigation.navigate('Profile')}
              >
                <LinearGradient
                  colors={['#00ff88', '#00cc6a']}
                  style={styles.continueGradient}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  statusContainer: { alignItems: 'center', marginBottom: 50 },
  statusIcon: { fontSize: 80, marginBottom: 20 },
  statusTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 30, textAlign: 'center' },
  
  planDetails: { alignItems: 'center', marginBottom: 30 },
  planName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  planPrice: { fontSize: 28, fontWeight: 'bold', color: '#00ff88', marginBottom: 5 },
  paymentMethod: { fontSize: 16, color: '#8a8a8a' },
  
  loader: { marginTop: 20 },
  
  retryButton: { borderRadius: 12, marginTop: 20 },
  retryGradient: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, alignItems: 'center' },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  continueButton: { borderRadius: 12, marginTop: 20 },
  continueGradient: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, alignItems: 'center' },
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
});

export default PaymentProcessingScreen;
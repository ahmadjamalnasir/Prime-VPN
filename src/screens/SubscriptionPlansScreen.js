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
import ApiService from '../services/ApiService';

const SubscriptionPlansScreen = ({ navigation, route }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { fromError = false } = route.params || {};

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getSubscriptionPlans();
      setPlans(response.plans || response);
    } catch (error) {
      Alert.alert('Error', 'Failed to load subscription plans');
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    Alert.alert(
      'Select Payment Method',
      `Subscribe to ${plan.name} for ${plan.price}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Stripe', onPress: () => handlePayment(plan, 'stripe') },
        { text: 'PayPal', onPress: () => handlePayment(plan, 'paypal') }
      ]
    );
  };

  const handlePayment = (plan, paymentMethod) => {
    navigation.navigate('PaymentProcessing', {
      plan,
      paymentMethod
    });
  };

  const renderPlan = (plan) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        plan.is_popular && styles.popularPlan,
        selectedPlan?.id === plan.id && styles.selectedPlan
      ]}
      onPress={() => handleSelectPlan(plan)}
    >
      {plan.is_popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planPrice}>{plan.price}</Text>
      <Text style={styles.planDuration}>{plan.duration}</Text>
      
      <View style={styles.featuresContainer}>
        {plan.features?.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[
          styles.selectButton,
          plan.is_popular && styles.popularButton
        ]}
        onPress={() => handleSelectPlan(plan)}
      >
        <LinearGradient
          colors={plan.is_popular ? ['#00ff88', '#00cc6a'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)']}
          style={styles.buttonGradient}
        >
          <Text style={[
            styles.selectButtonText,
            plan.is_popular && styles.popularButtonText
          ]}>
            Select Plan
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ff88" />
            <Text style={styles.loadingText}>Loading plans...</Text>
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
          <Text style={styles.headerTitle}>
            {fromError ? 'Upgrade Required' : 'Subscription Plans'}
          </Text>
        </View>

        {fromError && (
          <View style={styles.errorMessage}>
            <Text style={styles.errorText}>
              🔒 Premium server access requires a subscription
            </Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {plans.map(renderPlan)}
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
  errorMessage: {
    backgroundColor: 'rgba(255, 170, 0, 0.2)',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffaa00',
  },
  errorText: { color: '#ffaa00', fontSize: 16, textAlign: 'center' },
  scrollContent: { padding: 20 },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  popularPlan: {
    borderColor: '#00ff88',
    borderWidth: 2,
  },
  selectedPlan: {
    borderColor: '#00ff88',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#00ff88',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  planName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  planPrice: { fontSize: 32, fontWeight: 'bold', color: '#00ff88', marginBottom: 5 },
  planDuration: { fontSize: 16, color: '#8a8a8a', marginBottom: 20 },
  featuresContainer: { marginBottom: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureIcon: { color: '#00ff88', fontSize: 16, marginRight: 10 },
  featureText: { color: '#fff', fontSize: 16 },
  selectButton: { borderRadius: 12 },
  buttonGradient: { paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  selectButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  popularButton: {},
  popularButtonText: { color: '#fff' },
});

export default SubscriptionPlansScreen;
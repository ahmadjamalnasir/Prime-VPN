import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const SubscriptionScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [currentSubscription] = useState({
    isActive: false, // Change to true to test active subscription UI
    plan: 'Premium Monthly',
    renewalDate: '2024-02-15',
    daysRemaining: 23,
    paymentMethod: '**** 1234',
    nextBilling: '$9.99',
  });

  const plans = [
    {
      id: 'monthly',
      name: 'Premium Monthly',
      price: '$9.99',
      period: '/month',
      savings: null,
      features: ['Unlimited servers', 'No ads', 'High-speed connection', '24/7 support']
    },
    {
      id: 'yearly',
      name: 'Premium Yearly',
      price: '$59.99',
      period: '/year',
      savings: 'Save 50%',
      features: ['Unlimited servers', 'No ads', 'High-speed connection', '24/7 support', 'Priority support']
    }
  ];

  const handleSubscribe = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    Alert.alert(
      'Confirm Subscription',
      `Subscribe to ${plan.name} for ${plan.price}${plan.period}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe', onPress: () => navigation.navigate('Payment', { plan }) }
      ]
    );
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'Choose an option:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change Plan', onPress: () => Alert.alert('Change Plan', 'Plan change coming soon') },
        { text: 'Cancel Subscription', style: 'destructive', onPress: () => Alert.alert('Cancel', 'Cancellation coming soon') }
      ]
    );
  };

  const renderPlanCard = (plan) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        selectedPlan === plan.id && styles.selectedPlan,
        plan.id === 'yearly' && styles.popularPlan
      ]}
      onPress={() => setSelectedPlan(plan.id)}
    >
      {plan.id === 'yearly' && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        {plan.savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{plan.savings}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{plan.price}</Text>
        <Text style={styles.period}>{plan.period}</Text>
      </View>
      
      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Subscription</Text>
          </View>

          {/* Current Subscription Status */}
          {currentSubscription.isActive ? (
            <View style={styles.currentPlanContainer}>
              <View style={styles.currentPlanHeader}>
                <Text style={styles.currentPlanTitle}>Current Plan</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>Active</Text>
                </View>
              </View>
              
              <Text style={styles.currentPlanName}>{currentSubscription.plan}</Text>
              
              <View style={styles.planDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Days Remaining</Text>
                  <Text style={styles.detailValue}>{currentSubscription.daysRemaining} days</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Renewal Date</Text>
                  <Text style={styles.detailValue}>{currentSubscription.renewalDate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <Text style={styles.detailValue}>{currentSubscription.paymentMethod}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Next Billing</Text>
                  <Text style={styles.detailValue}>{currentSubscription.nextBilling}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.manageButton} onPress={handleManageSubscription}>
                <Text style={styles.manageButtonText}>Manage Subscription</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noSubscriptionContainer}>
              <Text style={styles.noSubscriptionTitle}>No Active Subscription</Text>
              <Text style={styles.noSubscriptionText}>
                Upgrade to Premium to unlock all servers and remove ads
              </Text>
            </View>
          )}

          {/* Premium Plans */}
          <View style={styles.plansContainer}>
            <Text style={styles.sectionTitle}>
              {currentSubscription.isActive ? 'Change Plan' : 'Choose Your Plan'}
            </Text>
            
            <View style={styles.plansGrid}>
              {plans.map(renderPlanCard)}
            </View>
          </View>

          {/* Feature Comparison */}
          <View style={styles.comparisonContainer}>
            <Text style={styles.sectionTitle}>Feature Comparison</Text>
            
            <View style={styles.comparisonTable}>
              <View style={styles.comparisonHeader}>
                <Text style={styles.comparisonHeaderText}>Feature</Text>
                <Text style={styles.comparisonHeaderText}>Free</Text>
                <Text style={styles.comparisonHeaderText}>Premium</Text>
              </View>
              
              {[
                { feature: 'Servers', free: '1 Server', premium: 'Unlimited' },
                { feature: 'Ads', free: 'Yes', premium: 'No' },
                { feature: 'Speed', free: 'Limited', premium: 'High-Speed' },
                { feature: 'Support', free: 'Basic', premium: '24/7 Priority' },
                { feature: 'Devices', free: '1 Device', premium: '5 Devices' }
              ].map((row, index) => (
                <View key={index} style={styles.comparisonRow}>
                  <Text style={styles.featureName}>{row.feature}</Text>
                  <Text style={styles.freeValue}>{row.free}</Text>
                  <Text style={styles.premiumValue}>{row.premium}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Subscribe Button */}
          {!currentSubscription.isActive && (
            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
              <LinearGradient colors={['#00ff88', '#00cc6a']} style={styles.subscribeGradient}>
                <Text style={styles.subscribeButtonText}>
                  Subscribe to {plans.find(p => p.id === selectedPlan)?.name}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backText: { color: '#00ff88', fontSize: 16, marginRight: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  
  currentPlanContainer: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  currentPlanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  currentPlanTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  activeBadge: { backgroundColor: '#00ff88', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  activeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  currentPlanName: { fontSize: 20, fontWeight: 'bold', color: '#00ff88', marginBottom: 20 },
  planDetails: { marginBottom: 20 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { color: '#8a8a8a', fontSize: 14 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  manageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  manageButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  noSubscriptionContainer: {
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffaa00',
  },
  noSubscriptionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffaa00', marginBottom: 10 },
  noSubscriptionText: { color: '#fff', textAlign: 'center', fontSize: 14 },
  
  plansContainer: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  plansGrid: { gap: 15 },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  selectedPlan: { borderColor: '#00ff88' },
  popularPlan: { borderColor: '#ffaa00' },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#ffaa00',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  popularText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  planName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  savingsBadge: { backgroundColor: '#00ff88', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  savingsText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  price: { fontSize: 32, fontWeight: 'bold', color: '#00ff88' },
  period: { fontSize: 16, color: '#8a8a8a', marginLeft: 5 },
  featuresContainer: { gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  checkmark: { color: '#00ff88', fontSize: 16, marginRight: 10, fontWeight: 'bold' },
  featureText: { color: '#fff', fontSize: 14 },
  
  comparisonContainer: { marginBottom: 30 },
  comparisonTable: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  comparisonHeaderText: { flex: 1, color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  comparisonRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  featureName: { flex: 1, color: '#fff', fontSize: 14 },
  freeValue: { flex: 1, color: '#8a8a8a', fontSize: 14, textAlign: 'center' },
  premiumValue: { flex: 1, color: '#00ff88', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  
  subscribeButton: { borderRadius: 15, marginTop: 20 },
  subscribeGradient: { paddingVertical: 18, borderRadius: 15, alignItems: 'center' },
  subscribeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default SubscriptionScreen;
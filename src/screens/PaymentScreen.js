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

const PaymentScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$9.99',
      period: 'month',
      popular: false,
      savings: null,
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$59.99',
      period: 'year',
      popular: true,
      savings: 'Save 50%',
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '$199.99',
      period: 'one-time',
      popular: false,
      savings: 'Best Value',
    },
  ];

  const features = [
    '�� Access to all 100+ servers worldwide',
    '⚡ Unlimited bandwidth & speed',
    '�� No ads or tracking',
    '📱 Connect up to 5 devices',
    '��️ Advanced security features',
    '📧 Priority customer support',
  ];

  const handlePurchase = (plan) => {
    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to purchase the ${plan.name} plan for ${plan.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Purchase', 
          onPress: () => {
            Alert.alert('Success', 'Thank you for your purchase! You now have premium access.');
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Upgrade to Premium</Text>
            <Text style={styles.headerSubtitle}>
              Unlock unlimited access to all VPN features
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Premium Features</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Pricing Plans */}
          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>Choose Your Plan</Text>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.selectedPlan,
                  plan.popular && styles.popularPlan
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
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
                  <Text style={styles.period}>/{plan.period}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Purchase Button */}
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => handlePurchase(plans.find(p => p.id === selectedPlan))}
          >
            <LinearGradient
              colors={['#00ff88', '#00cc6a']}
              style={styles.purchaseGradient}
            >
              <Text style={styles.purchaseButtonText}>
                Purchase {plans.find(p => p.id === selectedPlan)?.name} Plan
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={styles.securityContainer}>
            <Text style={styles.securityIcon}>��</Text>
            <Text style={styles.securityText}>
              All payments are secure and encrypted. Your data is protected.
            </Text>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By purchasing, you agree to our Terms of Service and Privacy Policy.
              Subscriptions auto-renew unless cancelled.
            </Text>
          </View>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8a8a8a',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  plansContainer: {
    marginBottom: 30,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#00ff88',
  },
  popularPlan: {
    borderColor: '#ffaa00',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#ffaa00',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  savingsBadge: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    color: '#00ff88',
    fontSize: 24,
    fontWeight: 'bold',
  },
  period: {
    color: '#8a8a8a',
    fontSize: 16,
    marginLeft: 5,
  },
  purchaseButton: {
    borderRadius: 12,
    marginBottom: 20,
  },
  purchaseGradient: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  securityText: {
    color: '#00ff88',
    fontSize: 14,
    flex: 1,
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    color: '#8a8a8a',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PaymentScreen;
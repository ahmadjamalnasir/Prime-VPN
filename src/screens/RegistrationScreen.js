import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect from 'react-native-picker-select';

const RegistrationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const countries = [
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Canada', value: 'CA' },
    { label: 'Germany', value: 'DE' },
    { label: 'France', value: 'FR' },
    { label: 'Japan', value: 'JP' },
    { label: 'Australia', value: 'AU' },
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = () => {
    const { name, email, phone, country, password, confirmPassword, acceptTerms } = formData;
    
    if (!name || !email || !phone || !country || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }

    // Simulate registration and verification
    Alert.alert(
      'Verification Required',
      'A verification code has been sent to your email. Please check your inbox.',
      [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
    );
  };

  const handleSocialLogin = (provider) => {
    Alert.alert('Social Login', `${provider} login will be implemented`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Create Account</Text>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#8a8a8a"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#8a8a8a"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#8a8a8a"
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                keyboardType="phone-pad"
              />

              <View style={styles.pickerContainer}>
                <RNPickerSelect
                  value={formData.country}
                  onValueChange={(value) => updateField('country', value)}
                  items={countries}
                  style={pickerSelectStyles}
                  placeholder={{ label: 'Select Country', value: '' }}
                />
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#8a8a8a"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry
              />
              
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#8a8a8a"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                secureTextEntry
              />

              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => updateField('acceptTerms', !formData.acceptTerms)}
              >
                <View style={[styles.checkbox, formData.acceptTerms && styles.checkboxChecked]}>
                  {formData.acceptTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>
                  I accept the Terms & Conditions and Privacy Policy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <LinearGradient
                  colors={['#00ff88', '#00cc6a']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.registerButtonText}>Create Account</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialContainer}>
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Google')}
                >
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Apple')}
                >
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  gradient: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 20, marginBottom: 30 },
  backButton: { marginBottom: 20 },
  backText: { color: '#00ff88', fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  formContainer: { flex: 1 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pickerContainer: { marginBottom: 15 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#8a8a8a',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#00ff88', borderColor: '#00ff88' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  checkboxText: { color: '#fff', fontSize: 14, flex: 1 },
  registerButton: { borderRadius: 12, marginBottom: 20 },
  buttonGradient: { paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  registerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#8a8a8a' },
  dividerText: { color: '#8a8a8a', paddingHorizontal: 15 },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  socialButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  socialButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loginLink: { alignItems: 'center', marginBottom: 20 },
  loginLinkText: { color: '#00ff88', fontSize: 16 },
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
  placeholder: { color: '#8a8a8a' },
});

export default RegistrationScreen;
// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    STATUS: '/users/{userId}/status',
    USAGE: '/users/{userId}/usage',
  },
  VPN: {
    SERVERS: '/vpn/servers',
    CONNECT: '/vpn/connect',
    DISCONNECT: '/vpn/disconnect',
    STATUS: '/vpn/status',
  },
  SUBSCRIPTIONS: {
    PLANS: '/subscriptions/plans',
    USER_SUBSCRIPTION: '/subscriptions/users/{userId}',
    CANCEL_SUBSCRIPTION: '/subscriptions/users/{userId}/cancel',
    SUBSCRIPTION_HISTORY: '/subscriptions/users/{userId}/history',
  },
  PAYMENTS: {
    INITIATE: '/payments/initiate',
    STATUS: '/payments/{paymentId}',
    CALLBACK: '/payments/callback',
  },
};
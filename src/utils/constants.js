export const COLORS = {
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#00ff88',
    accentDark: '#00cc6a',
    danger: '#ff4757',
    warning: '#ffaa00',
    text: '#ffffff',
    textSecondary: '#8a8a8a',
    background: '#0f3460',
    card: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
  };
  
  export const SERVERS = [
    { id: '1', name: 'United States', location: 'New York', ping: '45ms', flag: '��🇸', free: true },
    { id: '2', name: 'United States', location: 'Los Angeles', ping: '52ms', flag: '🇺��', free: false },
    { id: '3', name: 'United Kingdom', location: 'London', ping: '38ms', flag: '🇬��', free: false },
    { id: '4', name: 'Germany', location: 'Frankfurt', ping: '42ms', flag: '🇩��', free: false },
    { id: '5', name: 'Japan', location: 'Tokyo', ping: '78ms', flag: '🇯��', free: false },
    { id: '6', name: 'Singapore', location: 'Singapore', ping: '65ms', flag: '🇸��', free: false },
    { id: '7', name: 'Australia', location: 'Sydney', ping: '120ms', flag: '🇦��', free: false },
    { id: '8', name: 'Canada', location: 'Toronto', ping: '48ms', flag: '🇨🇦', free: false },
  ];
  
  export const SUBSCRIPTION_PLANS = [
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

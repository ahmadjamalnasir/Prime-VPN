import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect from 'react-native-picker-select';
import { useApp } from '../context/AppContext';

const ServerListScreen = ({ navigation }) => {
  const { user, servers, fetchServers, connectToServer, loading } = useApp();
  const [filteredServers, setFilteredServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCountry, setFilterCountry] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(['server_1', 'server_3']);
  const isPremium = user?.subscriptionStatus === 'premium';



  useEffect(() => {
    if (servers.length === 0) {
      fetchServers();
    }
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [servers, searchQuery, sortBy, filterCountry, showPremiumOnly, showFavoritesOnly]);

  const applyFiltersAndSort = () => {
    let filtered = [...servers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(server => 
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Country filter
    if (filterCountry) {
      filtered = filtered.filter(server => server.country === filterCountry);
    }

    // Premium filter
    if (showPremiumOnly) {
      filtered = filtered.filter(server => server.is_premium);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(server => favorites.includes(server.id));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ping':
          return a.ping - b.ping;
        case 'load':
          return a.load - b.load;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredServers(filtered);
  };

  const toggleFavorite = (serverId) => {
    setFavorites(prev => 
      prev.includes(serverId) 
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    );
  };

  const handleServerConnect = async (server) => {
    if (!isPremium && server.is_premium) {
      Alert.alert(
        'Premium Server',
        'This server requires a premium subscription. Upgrade to access all servers!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Payment') }
        ]
      );
      return;
    }

    try {
      await connectToServer(server.id, null, navigation);
      setSelectedServer(server);
      Alert.alert('Connected', `Connected to ${server.name}`);
      navigation.goBack();
    } catch (error) {
      // Error handling is done in AppContext, including navigation to plans
      if (!error.message.toLowerCase().includes('premium')) {
        Alert.alert('Connection Failed', error.message);
      }
    }
  };

  const getCountries = () => {
    const countries = [...new Set(servers.map(s => s.country))];
    return countries.map(country => ({ label: country, value: country }));
  };

  const getLoadColor = (load) => {
    if (load < 50) return '#00ff88';
    if (load < 80) return '#ffaa00';
    return '#ff4757';
  };

  const renderServerItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.serverCard,
        selectedServer?.id === item.id && styles.selectedCard,
        (!isPremium && item.is_premium) && styles.premiumCard
      ]}
      onPress={() => handleServerConnect(item)}
    >
      <View style={styles.serverHeader}>
        <Text style={styles.serverFlag}>{item.flag_icon}</Text>
        <View style={styles.serverInfo}>
          <View style={styles.serverTitleRow}>
            <Text style={styles.serverName}>{item.name}</Text>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Text style={styles.favoriteIcon}>
                {favorites.includes(item.id) ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.serverLocation}>{item.city}, {item.country}</Text>
        </View>
      </View>

      <View style={styles.serverStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Ping</Text>
          <Text style={styles.pingValue}>{item.ping}ms</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Load</Text>
          <View style={styles.loadContainer}>
            <View style={[styles.loadBar, { width: `${item.load}%`, backgroundColor: getLoadColor(item.load) }]} />
            <Text style={styles.loadText}>{item.load}%</Text>
          </View>
        </View>
        {(!isPremium && item.is_premium) && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>👑</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ff88" />
            <Text style={styles.loadingText}>Loading servers...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Server</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Payment')}>
            <Text style={styles.upgradeText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search servers..."
            placeholderTextColor="#8a8a8a"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <RNPickerSelect
                value={filterCountry}
                onValueChange={setFilterCountry}
                items={[{ label: 'All Countries', value: '' }, ...getCountries()]}
                style={pickerSelectStyles}
                placeholder={{ label: 'Filter by Country', value: '' }}
              />
            </View>
            <View style={styles.pickerWrapper}>
              <RNPickerSelect
                value={sortBy}
                onValueChange={setSortBy}
                items={[
                  { label: 'Sort by Name', value: 'name' },
                  { label: 'Sort by Ping', value: 'ping' },
                  { label: 'Sort by Load', value: 'load' }
                ]}
                style={pickerSelectStyles}
              />
            </View>
          </View>
          
          <View style={styles.toggleRow}>
            <TouchableOpacity 
              style={[styles.toggleButton, showFavoritesOnly && styles.toggleActive]}
              onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Text style={styles.toggleText}>⭐ Favorites</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, showPremiumOnly && styles.toggleActive]}
              onPress={() => setShowPremiumOnly(!showPremiumOnly)}
            >
              <Text style={styles.toggleText}>👑 Premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Server List */}
        <FlatList
          data={filteredServers}
          renderItem={renderServerItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backText: { color: '#00ff88', fontSize: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  upgradeText: { color: '#ffaa00', fontSize: 14, fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filtersContainer: { paddingHorizontal: 20, marginBottom: 15 },
  filterRow: { flexDirection: 'row', marginBottom: 10 },
  pickerWrapper: { flex: 1, marginHorizontal: 5 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-around' },
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleActive: { backgroundColor: '#00ff88', borderColor: '#00ff88' },
  toggleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  listContainer: { padding: 20 },
  serverCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedCard: { borderColor: '#00ff88', borderWidth: 2 },
  premiumCard: { opacity: 0.7 },
  serverHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  serverFlag: { fontSize: 30, marginRight: 15 },
  serverInfo: { flex: 1 },
  serverTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serverName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  serverLocation: { fontSize: 14, color: '#8a8a8a', marginTop: 5 },
  favoriteButton: { padding: 5 },
  favoriteIcon: { fontSize: 20 },
  serverStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { flex: 1 },
  statLabel: { fontSize: 12, color: '#8a8a8a', marginBottom: 5 },
  pingValue: { fontSize: 16, color: '#00ff88', fontWeight: 'bold' },
  loadContainer: { position: 'relative', height: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10 },
  loadBar: { height: '100%', borderRadius: 10 },
  loadText: { position: 'absolute', right: 5, top: 2, fontSize: 10, color: '#fff', fontWeight: 'bold' },
  premiumBadge: { backgroundColor: '#ffaa00', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  premiumText: { fontSize: 16 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeholder: { color: '#8a8a8a' },
});

export default ServerListScreen;
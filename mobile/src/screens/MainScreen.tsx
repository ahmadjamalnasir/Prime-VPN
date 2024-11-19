import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { ServerList } from '../components/ServerList';
import { AdBanner } from '../components/AdBanner';
import { VPNService } from '../services/vpn';
import { checkPremiumStatus } from '../store/actions/auth';

const MainScreen = () => {
  const dispatch = useDispatch();
  const { isPremium } = useSelector((state: RootState) => state.auth);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    dispatch(checkPremiumStatus());
  }, []);

  const handleConnect = async (server: Server) => {
    const vpn = VPNService.getInstance();
    const connected = await vpn.connect(server);
    setIsConnected(connected);
  };

  return (
    <View style={styles.container}>
      <ConnectionStatus isConnected={isConnected} />
      <ServerList onServerSelect={handleConnect} isPremium={isPremium} />
      {!isPremium && <AdBanner />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

export default MainScreen;

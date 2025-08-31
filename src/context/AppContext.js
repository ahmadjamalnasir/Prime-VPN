import React, { createContext, useContext, useReducer } from 'react';
import ApiService from '../services/ApiService';

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  servers: [],
  currentConnection: null,
  connectionStats: null,
  loading: false,
  error: null,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'SET_SERVERS':
      return { ...state, servers: action.payload };
    case 'SET_CONNECTION':
      return { ...state, currentConnection: action.payload };
    case 'SET_CONNECTION_STATS':
      return { ...state, connectionStats: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ApiService.login(credentials);
      dispatch({ type: 'SET_USER', payload: response.user });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const fetchServers = async () => {
    try {
      const response = await ApiService.getServers();
      dispatch({ type: 'SET_SERVERS', payload: response.servers });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const connectToServer = async (serverId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ApiService.connectToServer(serverId);
      dispatch({ type: 'SET_CONNECTION', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const disconnectFromServer = async () => {
    try {
      if (state.currentConnection?.connectionId) {
        await ApiService.disconnectFromServer(state.currentConnection.connectionId);
      }
      dispatch({ type: 'SET_CONNECTION', payload: null });
      dispatch({ type: 'SET_CONNECTION_STATS', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateConnectionStats = async () => {
    try {
      const stats = await ApiService.getConnectionStatus();
      dispatch({ type: 'SET_CONNECTION_STATS', payload: stats });
    } catch (error) {
      console.error('Failed to fetch connection stats:', error);
    }
  };

  const value = {
    ...state,
    login,
    logout,
    fetchServers,
    connectToServer,
    disconnectFromServer,
    updateConnectionStats,
    dispatch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

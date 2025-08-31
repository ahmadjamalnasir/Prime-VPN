import * as SecureStore from 'expo-secure-store';

export const storeToken = async (token) => {
  try {
    await SecureStore.setItemAsync('authToken', token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync('authToken');
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};
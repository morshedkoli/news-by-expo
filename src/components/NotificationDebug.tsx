import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import notificationService from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationDebug() {
  const [token, setToken] = useState('');
  const [permissions, setPermissions] = useState('');
  const [registered, setRegistered] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    checkStatus();
    setupNotificationListeners();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const setupNotificationListeners = () => {
    // Listen for notifications received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      addLog(`🔔 Notification received: ${notification.request.content.title}`);
      console.log('Debug: Notification received:', notification);
    });

    // Listen for notification responses (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      addLog(`👆 Notification tapped: ${response.notification.request.content.title}`);
      console.log('Debug: Notification tapped:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  };

  const checkStatus = async () => {
    try {
      // Check permissions
      const { status } = await Notifications.getPermissionsAsync();
      setPermissions(status);
      addLog(`Permission status: ${status}`);

      // Check token
      const savedToken = await AsyncStorage.getItem('expo_push_token');
      setToken(savedToken || 'No token');
      addLog(`Token: ${savedToken ? 'Available' : 'Not found'}`);

      // Check registration
      const isRegistered = await AsyncStorage.getItem('token_registered');
      setRegistered(isRegistered === 'true');
      addLog(`Registration: ${isRegistered === 'true' ? 'Yes' : 'No'}`);
    } catch (error) {
      addLog(`Error checking status: ${error}`);
    }
  };

  const requestPermissions = async () => {
    try {
      addLog('Requesting permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissions(status);
      addLog(`Permission result: ${status}`);
      Alert.alert('Permission Status', status);
    } catch (error) {
      addLog(`Permission error: ${error}`);
      Alert.alert('Error', String(error));
    }
  };

  const getToken = async () => {
    try {
      addLog('Getting push token...');
      const newToken = await notificationService.getExpoPushToken();
      setToken(newToken || 'Failed to get token');
      addLog(`Token result: ${newToken ? 'Success' : 'Failed'}`);
    } catch (error) {
      addLog(`Token error: ${error}`);
      Alert.alert('Error', String(error));
    }
  };

  const registerToken = async () => {
    try {
      if (token && token !== 'No token' && token !== 'Failed to get token') {
        addLog('Registering token...');
        await notificationService.registerToken(token);
        setRegistered(true);
        addLog('Token registered successfully');
        Alert.alert('Success', 'Token registered successfully');
      } else {
        Alert.alert('Error', 'No valid token available');
      }
    } catch (error) {
      addLog(`Registration error: ${error}`);
      Alert.alert('Error', String(error));
    }
  };

  const testLocalNotification = async () => {
    try {
      addLog('Sending test notification...');
      await notificationService.scheduleLocalNotification(
        'Test Notification',
        'This is a test notification from your app',
        { type: 'general' }
      );
      addLog('Test notification sent');
    } catch (error) {
      addLog(`Test notification error: ${error}`);
    }
  };

  const reinitializeService = async () => {
    try {
      addLog('Reinitializing notification service...');
      const success = await notificationService.initialize();
      addLog(`Reinitialization: ${success ? 'Success' : 'Failed'}`);
      await checkStatus();
    } catch (error) {
      addLog(`Reinitialization error: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔔 Notification Debug</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Permissions:</Text>
        <Text style={styles.value}>{permissions}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Token:</Text>
        <Text style={styles.value} numberOfLines={2}>{token}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Registered:</Text>
        <Text style={styles.value}>{registered ? 'Yes' : 'No'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Request Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={getToken}>
          <Text style={styles.buttonText}>Get Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={registerToken}>
          <Text style={styles.buttonText}>Register Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testLocalNotification}>
          <Text style={styles.buttonText}>Test Local Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={reinitializeService}>
          <Text style={styles.buttonText}>Reinitialize Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={checkStatus}>
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsSection}>
        <Text style={styles.logsTitle}>📋 Debug Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  logText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});

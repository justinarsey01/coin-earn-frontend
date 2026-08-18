import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logo}>C</Text>
      </View>
      <Text style={styles.appName}>CoinEarn</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 30 }} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.white,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: Colors.gray,
  },
});
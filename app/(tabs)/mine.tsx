import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useUser } from '../../context/UserContext';
import AnimatedCircle from '../../components/AnimatedCircle';
import { Colors } from '../../constants/Colors';

export default function MineScreen() {
  const {
    balance,
    canClaim,
    timeLeft,
    claimReward,
    isBoostActive,
    boostTimeLeft,
    activateBoost,
  } = useUser();

  const handleClaim = async () => {

  if (!canClaim) {
    return;
  }

  try {

    await claimReward();

    Alert.alert(
  'Success!',
  'You mined 10 coins!'
);

  } catch (error: any) {

    console.error(
      'MINING ERROR:',
      error
    );

    Alert.alert(
      'Mining Failed',
      error?.message ||
        'Unable to claim your mining reward. Please try again.'
    );
  }
};

  const handleBoost = () => {
    if (isBoostActive) {
      Alert.alert('Boost Active', 'Your +3% boost is already running.');
      return;
    }

    Alert.alert(
      'Activate Boost?',
      'Get +3% mining rate for the next 1 hour.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: () => {
            activateBoost();
            Alert.alert('Boost Activated!', '+3% mining rate for 1 hour');
          },
        },
      ]
    );
  };

  // Format boost time
  const formatBoostTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mine Coins</Text>
        <Text style={styles.balance}>
          Balance: <Text style={styles.balanceValue}>{balance.toFixed(2)}</Text>
        </Text>
      </View>

      {/* Big animated circle */}
      <AnimatedCircle
        canClaim={canClaim}
        onPress={handleClaim}
        timeLeft={timeLeft}
      />

      {/* Info text */}
      <Text style={styles.info}>
        {canClaim
          ? 'Tap the circle to claim your coins'
          : 'Come back after the countdown ends'}
      </Text>

      {/* Boost Section */}
      <View style={styles.boostCard}>
        <View style={styles.boostLeft}>
          <Text style={styles.boostTitle}>1-Hour Boost</Text>
          <Text style={styles.boostDesc}>+3% mining rate</Text>
          {isBoostActive && (
            <Text style={styles.boostTimer}>
              Active • {formatBoostTime(boostTimeLeft)} left
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.boostButton,
            isBoostActive && styles.boostButtonActive,
          ]}
          onPress={handleBoost}
          disabled={isBoostActive}
        >
          <Text style={styles.boostButtonText}>
            {isBoostActive ? 'Active' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Small tip */}
      <Text style={styles.tip}>
        Tip: Activate boost before claiming to earn more!
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  balance: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 6,
  },
  balanceValue: {
    color: Colors.primary,
    fontWeight: '700',
  },
  info: {
    textAlign: 'center',
    color: Colors.gray,
    fontSize: 15,
    marginTop: 16,
    marginBottom: 30,
  },
  boostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  boostLeft: {
    flex: 1,
  },
  boostTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  boostDesc: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 2,
  },
  boostTimer: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  boostButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  boostButtonActive: {
    backgroundColor: '#94A3B8',
  },
  boostButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  tip: {
    textAlign: 'center',
    color: Colors.gray,
    fontSize: 13,
    marginTop: 24,
  },
});
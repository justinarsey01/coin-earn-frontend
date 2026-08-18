import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { balance, canClaim, isBoostActive, tasks } = useUser();

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.appName}>CoinEarn</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>v1.0</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceValue}>{balance.toFixed(2)}</Text>
          <Text style={styles.balanceUnit}>Coins</Text>

          <TouchableOpacity
            style={styles.mineBtn}
            onPress={() => router.push('/mine')}
          >
            <Ionicons name="flash" size={18} color={Colors.white} />
            <Text style={styles.mineBtnText}>
              {canClaim ? 'Mine Now' : 'View Mining'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="checkbox" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>
              {completedTasks}/{totalTasks}
            </Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons
              name={isBoostActive ? 'rocket' : 'rocket-outline'}
              size={22}
              color={isBoostActive ? Colors.primary : Colors.gray}
            />
            <Text style={styles.statValue}>
              {isBoostActive ? 'ON' : 'OFF'}
            </Text>
            <Text style={styles.statLabel}>Boost</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons
              name={canClaim ? 'checkmark-circle' : 'time'}
              size={22}
              color={canClaim ? Colors.success : Colors.gray}
            />
            <Text style={styles.statValue}>
              {canClaim ? 'Ready' : 'Locked'}
            </Text>
            <Text style={styles.statLabel}>Claim</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/task')}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="checkbox" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.actionTitle}>Complete Tasks</Text>
              <Text style={styles.actionDesc}>Earn +5 coins per task</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/wallet')}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="wallet" size={22} color="#16A34A" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Swap Coins</Text>
              <Text style={styles.actionDesc}>Airtime • Data • USDT</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/mine')}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flash" size={22} color="#D97706" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Mine Coins</Text>
              <Text style={styles.actionDesc}>Tap once every 24 hours</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.gray,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  balanceValue: {
    color: Colors.white,
    fontSize: 42,
    fontWeight: '800',
    marginTop: 4,
  },
  balanceUnit: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
  },
  mineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },
  mineBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  actionDesc: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
  },
});
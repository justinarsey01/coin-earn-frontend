import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { Colors } from '../../constants/Colors';

export default function WalletScreen() {
 
  const [amount, setAmount] = useState('');
  const { balance, swapCoins, transactions } = useUser();

  const handleSwap = (type: 'airtime' | 'data' | 'usdt') => {
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number greater than 0');
      return;
    }

    if (value > balance) {
      Alert.alert('Insufficient Balance', 'You do not have enough coins');
      return;
    }

    // Confirm before swapping
    const typeName =
      type === 'airtime' ? 'Airtime' : type === 'data' ? 'Data' : 'USDT';

    Alert.alert(
      'Confirm Swap',
      `Swap ${value} coins for ${typeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            const success = swapCoins(value, type);
            if (success) {
              setAmount('');
              Alert.alert(
                'Success!',
                `You successfully swapped ${value} coins to ${typeName}.\n\n(In a real app this would send to your phone number or wallet)`
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>Wallet</Text>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>{balance.toFixed(2)}</Text>
          <Text style={styles.balanceUnit}>Coins</Text>
        </View>

        {/* Amount Input */}
        <Text style={styles.sectionTitle}>Amount to Swap</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount (e.g. 50)"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Quick amounts */}
        <View style={styles.quickRow}>
          {[10, 50, 100, 200].map((val) => (
            <TouchableOpacity
              key={val}
              style={styles.quickBtn}
              onPress={() => setAmount(String(val))}
            >
              <Text style={styles.quickText}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Swap Options */}
        <Text style={styles.sectionTitle}>Swap To</Text>

        {/* Airtime */}
        <TouchableOpacity
          style={styles.swapCard}
          onPress={() => handleSwap('airtime')}
          activeOpacity={0.8}
        >
          <View style={styles.swapLeft}>
            <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
              <Text style={styles.icon}>📱</Text>
            </View>
            <View>
              <Text style={styles.swapTitle}>Airtime</Text>
              <Text style={styles.swapDesc}>Send to any phone number</Text>
            </View>
          </View>
          <Text style={styles.swapArrow}>→</Text>
        </TouchableOpacity>

        {/* Data */}
        <TouchableOpacity
          style={styles.swapCard}
          onPress={() => handleSwap('data')}
          activeOpacity={0.8}
        >
          <View style={styles.swapLeft}>
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Text style={styles.icon}>📶</Text>
            </View>
            <View>
              <Text style={styles.swapTitle}>Data</Text>
              <Text style={styles.swapDesc}>Mobile data bundles</Text>
            </View>
          </View>
          <Text style={styles.swapArrow}>→</Text>
        </TouchableOpacity>

        {/* USDT */}
        <TouchableOpacity
          style={styles.swapCard}
          onPress={() => handleSwap('usdt')}
          activeOpacity={0.8}
        >
          <View style={styles.swapLeft}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.icon}>₮</Text>
            </View>
            <View>
              <Text style={styles.swapTitle}>USDT</Text>
              <Text style={styles.swapDesc}>Crypto (TRC20 / ERC20)</Text>
            </View>
          </View>
          <Text style={styles.swapArrow}>→</Text>
        </TouchableOpacity>

        {/* Note */}
        <Text style={styles.note}>
          Note: This is a demo. In a real app you would connect payment APIs
          (Flutterwave, Paystack, Binance, etc.) to actually send airtime, data or USDT.
        </Text>
        {/* Transaction History */}
<Text style={[styles.sectionTitle, { marginTop: 30 }]}>Transaction History</Text>

{transactions.length === 0 ? (
  <Text style={{ color: Colors.gray, textAlign: 'center', marginTop: 10 }}>
    No transactions yet
  </Text>
) : (
  transactions.map((tx) => (
    <View key={tx.id} style={styles.txCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.txDesc}>{tx.description}</Text>
        <Text style={styles.txDate}>
          {new Date(tx.date).toLocaleString()}
        </Text>
      </View>
      <Text
        style={[
          styles.txAmount,
          { color: tx.amount >= 0 ? '#16A34A' : Colors.danger },
        ]}
      >
        {tx.amount >= 0 ? '+' : ''}
        {tx.amount.toFixed(2)}
      </Text>
    </View>
  ))
)}
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 28,
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
    marginTop: 6,
  },
  balanceUnit: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  swapCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  swapLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  swapTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  swapDesc: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
  },
  swapArrow: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '600',
  },
  note: {
    marginTop: 24,
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 20,
    textAlign: 'center',
  },
  txCard: {
  backgroundColor: Colors.white,
  borderRadius: 12,
  padding: 14,
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
  elevation: 1,
},
txDesc: {
  fontSize: 15,
  fontWeight: '600',
  color: Colors.text,
},
txDate: {
  fontSize: 12,
  color: Colors.gray,
  marginTop: 3,
},
txAmount: {
  fontSize: 16,
  fontWeight: '700',
},
});
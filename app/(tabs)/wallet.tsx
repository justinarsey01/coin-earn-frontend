import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';

import { Ionicons } from '@expo/vector-icons';

import { useUser } from '../../context/UserContext';
import { Colors } from '../../constants/Colors';

export default function WalletScreen() {
  const [amount, setAmount] = useState('');

  const [recipient, setRecipient] =
    useState('');

  const [transferAmount, setTransferAmount] =
    useState('');

  const [isTransferring, setIsTransferring] =
    useState(false);

  const [isRefreshingWallet, setIsRefreshingWallet] =
    useState(false);

  const {
    balance,
    walletAddress,
    refreshWallet,
    swapCoins,
    transactions,
    transferCoins,
  } = useUser();

  // ======================================================
  // LOAD WALLET
  // ======================================================

  useEffect(() => {
    const loadWallet = async () => {
      try {
        setIsRefreshingWallet(true);

        await refreshWallet();
      } catch (error) {
        console.error(
          'WALLET LOAD ERROR:',
          error,
        );
      } finally {
        setIsRefreshingWallet(false);
      }
    };

    loadWallet();
  }, []);

  // ======================================================
  // REFRESH WALLET
  // ======================================================

  const handleRefreshWallet =
    async () => {
      try {
        setIsRefreshingWallet(true);

        await refreshWallet();

        Alert.alert(
          'Wallet Refreshed',
          'Your wallet information has been updated.',
        );
      } catch (error: any) {
        console.error(
          'WALLET REFRESH ERROR:',
          error,
        );

        Alert.alert(
          'Refresh Failed',
          error?.message ||
            'Unable to refresh your wallet.',
        );
      } finally {
        setIsRefreshingWallet(false);
      }
    };

  // ======================================================
  // COPY WALLET ADDRESS
  // ======================================================

  const handleCopyWalletAddress =
    async () => {
      if (!walletAddress) {
        Alert.alert(
          'Wallet Unavailable',
          'Your wallet address is not available yet. Please refresh and try again.',
        );

        return;
      }

      try {
        await Clipboard.setStringAsync(
          walletAddress,
        );

        Alert.alert(
          'Copied! 🎉',
          'Wallet address copied to clipboard.',
        );
      } catch (error) {
        console.error(
          'COPY WALLET ADDRESS ERROR:',
          error,
        );

        Alert.alert(
          'Copy Failed',
          'Unable to copy wallet address.',
        );
      }
    };

  // ======================================================
  // SWAP
  // ======================================================

  const handleSwap = (
    type: 'airtime' | 'data' | 'usdt',
  ) => {
    const value = parseFloat(amount);

    if (
      isNaN(value) ||
      value <= 0
    ) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid number greater than 0.',
      );

      return;
    }

    if (value > balance) {
      Alert.alert(
        'Insufficient Balance',
        'You do not have enough coins.',
      );

      return;
    }

    const typeName =
      type === 'airtime'
        ? 'Airtime'
        : type === 'data'
          ? 'Data'
          : 'USDT';

    Alert.alert(
      'Confirm Swap',
      `Swap ${value.toFixed(
        2,
      )} coins for ${typeName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Confirm',

          onPress: () => {
            const success =
              swapCoins(
                value,
                type,
              );

            if (success) {
              setAmount('');

              Alert.alert(
                'Success!',
                `You successfully swapped ${value.toFixed(
                  2,
                )} coins to ${typeName}.`,
              );
            } else {
              Alert.alert(
                'Swap Failed',
                'Unable to complete this swap.',
              );
            }
          },
        },
      ],
    );
  };

  // ======================================================
  // TRANSFER COINS
  // ======================================================

  const handleTransfer = () => {
    const value =
      parseFloat(transferAmount);

    const cleanRecipient =
      recipient
        .trim()
        .toUpperCase();

    if (!cleanRecipient) {
      Alert.alert(
        'Recipient Required',
        'Enter the recipient wallet address.',
      );

      return;
    }

    if (
      !walletAddress
    ) {
      Alert.alert(
        'Wallet Unavailable',
        'Your wallet address is not available yet. Please refresh and try again.',
      );

      return;
    }

    if (
      cleanRecipient ===
      walletAddress.toUpperCase()
    ) {
      Alert.alert(
        'Invalid Recipient',
        'You cannot transfer coins to your own wallet.',
      );

      return;
    }

    if (
      isNaN(value) ||
      value <= 0
    ) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid amount greater than 0.',
      );

      return;
    }

    if (value > balance) {
      Alert.alert(
        'Insufficient Balance',
        'You do not have enough coins for this transfer.',
      );

      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Send ${value.toFixed(
        2,
      )} coins to:\n\n${cleanRecipient}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Send Coins',

          onPress: async () => {
            try {
              setIsTransferring(true);

              await transferCoins(
                cleanRecipient,
                value,
              );

              setRecipient('');
              setTransferAmount('');

              Alert.alert(
                'Transfer Successful 🎉',
                `${value.toFixed(
                  2,
                )} coins were sent successfully.`,
              );
            } catch (error: any) {
              console.error(
                'TRANSFER ERROR:',
                error,
              );

              Alert.alert(
                'Transfer Failed',
                error?.message ||
                  'Something went wrong. Please try again.',
              );
            } finally {
              setIsTransferring(false);
            }
          },
        },
      ],
    );
  };

  // ======================================================
  // FORMAT TRANSACTION AMOUNT
  // ======================================================
  //
  // Sent:
  // -9.00  RED
  //
  // Received:
  // +9.00  GREEN
  //
  // Mining:
  // +10.00 GREEN
  //
  // ======================================================

  const formatTransactionAmount = (
    tx: any,
  ) => {
    const rawAmount =
      Number(tx?.amount ?? 0);

    const absoluteAmount =
      Math.abs(rawAmount);

    const transactionType =
      String(
        tx?.type || '',
      ).toLowerCase();

    const direction =
      String(
        tx?.direction || '',
      ).toLowerCase();

    const isSent =
      transactionType ===
        'sent' ||
      transactionType ===
        'transfer_out' ||
      direction ===
        'debit' ||
      rawAmount < 0;

    const isReceived =
      transactionType ===
        'received' ||
      transactionType ===
        'transfer_in' ||
      direction ===
        'credit';

    let sign = '';

    if (isSent) {
      sign = '-';
    } else if (
      isReceived ||
      rawAmount > 0
    ) {
      sign = '+';
    }

    return {
      text: `${sign}${absoluteAmount.toFixed(
        2,
      )}`,
      isSent,
    };
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <Text style={styles.title}>
          Wallet
        </Text>

        {/* ==================================================
            BALANCE CARD
        ================================================== */}

        <View
          style={styles.balanceCard}
        >
          <View
            style={styles.balanceIcon}
          >
            <Ionicons
              name="wallet"
              size={26}
              color={Colors.white}
            />
          </View>

          <Text
            style={styles.balanceLabel}
          >
            Available Balance
          </Text>

          <Text
            style={styles.balanceValue}
          >
            {Number(
              balance || 0,
            ).toFixed(2)}
          </Text>

          <Text
            style={styles.balanceUnit}
          >
            COINS
          </Text>
        </View>

        {/* ==================================================
            WALLET ADDRESS
        ================================================== */}

        <View
          style={styles.walletAddressCard}
        >
          <View
            style={
              styles.walletAddressHeader
            }
          >
            <View
              style={
                styles.walletAddressIcon
              }
            >
              <Ionicons
                name="key-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={
                  styles.walletAddressTitle
                }
              >
                Your Wallet Address
              </Text>

              <Text
                style={
                  styles.walletAddressDescription
                }
              >
                Share this address to receive coins from another CoinEarn user.
              </Text>
            </View>
          </View>

          {walletAddress ? (
            <>
              <View
                style={
                  styles.walletAddressBox
                }
              >
                <Text
                  style={
                    styles.walletAddressText
                  }
                  selectable
                >
                  {walletAddress}
                </Text>
              </View>

              <View
                style={
                  styles.walletActions
                }
              >
                <TouchableOpacity
                  style={
                    styles.copyWalletButton
                  }
                  onPress={
                    handleCopyWalletAddress
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="copy-outline"
                    size={18}
                    color={Colors.white}
                  />

                  <Text
                    style={
                      styles.copyWalletText
                    }
                  >
                    Copy Address
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.refreshWalletButton
                  }
                  onPress={
                    handleRefreshWallet
                  }
                  disabled={
                    isRefreshingWallet
                  }
                  activeOpacity={0.8}
                >
                  {isRefreshingWallet ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        Colors.primary
                      }
                    />
                  ) : (
                    <Ionicons
                      name="refresh-outline"
                      size={20}
                      color={
                        Colors.primary
                      }
                    />
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View
              style={
                styles.walletLoading
              }
            >
              {isRefreshingWallet ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color={
                      Colors.primary
                    }
                  />

                  <Text
                    style={
                      styles.walletLoadingText
                    }
                  >
                    Loading wallet address...
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={
                      styles.walletUnavailableText
                    }
                  >
                    Wallet address unavailable.
                  </Text>

                  <TouchableOpacity
                    onPress={
                      handleRefreshWallet
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        styles.tryAgainText
                      }
                    >
                      Try Again
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {/* ==================================================
            TRANSFER COINS
        ================================================== */}

        <View
          style={styles.transferCard}
        >
          <View
            style={
              styles.transferHeader
            }
          >
            <View
              style={
                styles.transferIcon
              }
            >
              <Ionicons
                name="send"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={
                  styles.transferTitle
                }
              >
                Transfer Coins
              </Text>

              <Text
                style={
                  styles.transferDescription
                }
              >
                Send coins instantly to another CoinEarn user
              </Text>
            </View>
          </View>

          {/* RECIPIENT */}

          <Text
            style={styles.inputLabel}
          >
            Recipient Wallet Address
          </Text>

          <View
            style={
              styles.inputContainer
            }
          >
            <Ionicons
              name="wallet-outline"
              size={19}
              color={Colors.gray}
            />

            <TextInput
              style={
                styles.transferInput
              }
              placeholder="Enter wallet address"
              placeholderTextColor="#94A3B8"
              value={recipient}
              onChangeText={
                setRecipient
              }
              autoCapitalize="characters"
              autoCorrect={false}
              editable={
                !isTransferring
              }
            />
          </View>

          {/* AMOUNT */}

          <Text
            style={styles.inputLabel}
          >
            Amount
          </Text>

          <View
            style={
              styles.inputContainer
            }
          >
            <Ionicons
              name="cash-outline"
              size={19}
              color={Colors.gray}
            />

            <TextInput
              style={
                styles.transferInput
              }
              placeholder="Enter coin amount"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              value={transferAmount}
              onChangeText={
                setTransferAmount
              }
              editable={
                !isTransferring
              }
            />

            <Text
              style={
                styles.coinInputLabel
              }
            >
              COINS
            </Text>
          </View>

          {/* QUICK AMOUNTS */}

          <View
            style={
              styles.transferQuickRow
            }
          >
            {[10, 50, 100, 150].map(
              (value) => (
                <TouchableOpacity
                  key={value}
                  style={
                    styles.transferQuickButton
                  }
                  onPress={() =>
                    setTransferAmount(
                      String(value),
                    )
                  }
                  disabled={
                    isTransferring
                  }
                >
                  <Text
                    style={
                      styles.transferQuickText
                    }
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          {/* SEND */}

          <TouchableOpacity
            style={[
              styles.transferButton,
              isTransferring &&
                styles.disabledButton,
            ]}
            onPress={
              handleTransfer
            }
            disabled={
              isTransferring
            }
            activeOpacity={0.85}
          >
            {isTransferring ? (
              <ActivityIndicator
                color={Colors.white}
              />
            ) : (
              <>
                <Ionicons
                  name="send"
                  size={18}
                  color={Colors.white}
                />

                <Text
                  style={
                    styles.transferButtonText
                  }
                >
                  Send Coins
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ==================================================
            SWAP
        ================================================== */}

        <Text
          style={styles.sectionTitle}
        >
          Amount to Swap
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter amount (e.g. 50)"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        {/* QUICK AMOUNTS */}

        <View
          style={styles.quickRow}
        >
          {[10, 50, 100, 200].map(
            (val) => (
              <TouchableOpacity
                key={val}
                style={styles.quickBtn}
                onPress={() =>
                  setAmount(
                    String(val),
                  )
                }
              >
                <Text
                  style={
                    styles.quickText
                  }
                >
                  {val}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        {/* ==================================================
            SWAP OPTIONS
        ================================================== */}

        <Text
          style={styles.sectionTitle}
        >
          Swap To
        </Text>

        {/* AIRTIME */}

        <TouchableOpacity
          style={styles.swapCard}
          onPress={() =>
            handleSwap('airtime')
          }
          activeOpacity={0.8}
        >
          <View
            style={styles.swapLeft}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor:
                    '#DBEAFE',
                },
              ]}
            >
              <Text
                style={styles.icon}
              >
                📱
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.swapTitle
                }
              >
                Airtime
              </Text>

              <Text
                style={
                  styles.swapDesc
                }
              >
                Send to any phone number
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.primary}
          />
        </TouchableOpacity>

        {/* DATA */}

        <TouchableOpacity
          style={styles.swapCard}
          onPress={() =>
            handleSwap('data')
          }
          activeOpacity={0.8}
        >
          <View
            style={styles.swapLeft}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor:
                    '#DCFCE7',
                },
              ]}
            >
              <Text
                style={styles.icon}
              >
                📶
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.swapTitle
                }
              >
                Data
              </Text>

              <Text
                style={
                  styles.swapDesc
                }
              >
                Mobile data bundles
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.primary}
          />
        </TouchableOpacity>

        {/* USDT */}

        <TouchableOpacity
          style={styles.swapCard}
          onPress={() =>
            handleSwap('usdt')
          }
          activeOpacity={0.8}
        >
          <View
            style={styles.swapLeft}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor:
                    '#FEF3C7',
                },
              ]}
            >
              <Text
                style={styles.icon}
              >
                ₮
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.swapTitle
                }
              >
                USDT
              </Text>

              <Text
                style={
                  styles.swapDesc
                }
              >
                Crypto withdrawal
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.primary}
          />
        </TouchableOpacity>

        {/* ==================================================
            NOTE
        ================================================== */}

        <Text style={styles.note}>
          Transfers are only available between registered
          CoinEarn users. Share your wallet address to
          receive coins.
        </Text>

        {/* ==================================================
            TRANSACTION HISTORY
        ================================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              marginTop: 30,
            },
          ]}
        >
          Transaction History
        </Text>

        {transactions.length === 0 ? (
          <Text
            style={
              styles.emptyTransactions
            }
          >
            No transactions yet
          </Text>
        ) : (
          transactions.map(
            (tx: any) => {
              const formattedAmount =
                formatTransactionAmount(
                  tx,
                );

              return (
                <View
                  key={tx.id}
                  style={styles.txCard}
                >
                  {/* TRANSACTION ICON */}

                  <View
                    style={[
                      styles.txIcon,
                      {
                        backgroundColor:
                          formattedAmount.isSent
                            ? '#FEE2E2'
                            : '#DCFCE7',
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        formattedAmount.isSent
                          ? 'arrow-up'
                          : 'arrow-down'
                      }
                      size={19}
                      color={
                        formattedAmount.isSent
                          ? Colors.danger
                          : '#16A34A'
                      }
                    />
                  </View>

                  {/* TRANSACTION DETAILS */}

                  <View
                    style={
                      styles.txDetails
                    }
                  >
                    <Text
                      style={
                        styles.txDesc
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {tx.description ||
                        'Coin transaction'}
                    </Text>

                    <Text
                      style={
                        styles.txDate
                      }
                    >
                      {new Date(
                        tx.created_at ||
                          tx.date,
                      ).toLocaleString()}
                    </Text>
                  </View>

                  {/* TRANSACTION AMOUNT */}

                  <Text
                    style={[
                      styles.txAmount,
                      {
                        color:
                          formattedAmount.isSent
                            ? Colors.danger
                            : '#16A34A',
                      },
                    ]}
                  >
                    {
                      formattedAmount.text
                    }
                  </Text>
                </View>
              );
            },
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
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

  // ====================================================
  // BALANCE
  // ====================================================

  balanceCard: {
    backgroundColor:
      Colors.primary,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 6,
    shadowColor:
      Colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor:
      'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  balanceLabel: {
    color:
      'rgba(255,255,255,0.85)',
    fontSize: 15,
  },

  balanceValue: {
    color: Colors.white,
    fontSize: 42,
    fontWeight: '800',
    marginTop: 6,
  },

  balanceUnit: {
    color:
      'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },

  // ====================================================
  // WALLET ADDRESS
  // ====================================================

  walletAddressCard: {
    backgroundColor:
      Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  walletAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  walletAddressIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  walletAddressTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },

  walletAddressDescription: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 3,
    lineHeight: 17,
  },

  walletAddressBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
  },

  walletAddressText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  walletActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },

  copyWalletButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor:
      Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  copyWalletText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },

  refreshWalletButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  walletLoading: {
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  walletLoadingText: {
    color: Colors.gray,
    fontSize: 13,
  },

  walletUnavailableText: {
    color: Colors.gray,
    fontSize: 13,
  },

  tryAgainText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  // ====================================================
  // TRANSFER
  // ====================================================

  transferCard: {
    backgroundColor:
      Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  transferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  transferIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  transferTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },

  transferDescription: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 3,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 7,
    marginTop: 10,
  },

  inputContainer: {
    minHeight: 54,
    backgroundColor:
      '#F8FAFC',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  transferInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    paddingHorizontal: 10,
  },

  coinInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.gray,
  },

  transferQuickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 18,
  },

  transferQuickButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },

  transferQuickText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  transferButton: {
    minHeight: 52,
    backgroundColor:
      Colors.primary,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  disabledButton: {
    opacity: 0.6,
  },

  transferButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },

  // ====================================================
  // GENERAL
  // ====================================================

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },

  input: {
    backgroundColor:
      Colors.white,
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
    backgroundColor:
      Colors.white,
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

  // ====================================================
  // SWAP
  // ====================================================

  swapCard: {
    backgroundColor:
      Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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

  note: {
    marginTop: 24,
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 20,
    textAlign: 'center',
  },

  // ====================================================
  // TRANSACTIONS
  // ====================================================

  emptyTransactions: {
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },

  txCard: {
    backgroundColor:
      Colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },

  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  txDetails: {
    flex: 1,
    paddingRight: 10,
  },

  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 19,
  },

  txDate: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
  },

  txAmount: {
    fontSize: 16,
    fontWeight: '800',
    minWidth: 70,
    textAlign: 'right',
  },
  
});
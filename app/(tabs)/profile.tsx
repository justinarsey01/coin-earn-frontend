import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
  Share,
  Platform,
} from 'react-native';

import { useRouter } from 'expo-router';

import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';

import { useUser } from '../../context/UserContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();

  const {
    balance,
    tasks,
    user,
    logout,
  } = useUser();

  // ==========================================
  // COMPLETED TASKS
  // ==========================================

  const completedTasks =
    tasks?.filter((task: any) => task.completed).length || 0;

  // ==========================================
  // REFERRAL INFORMATION
  // ==========================================

  const referralCode =
    user?.referralCode || '';

  const referralCount =
    Number(user?.referralCount || 0);

  const REFERRAL_REWARD = 150;

  const referralEarnings =
    referralCount * REFERRAL_REWARD;

  // ==========================================
  // REFERRAL LINK
  // ==========================================
  // This creates a deep link to:
  // your-app://register?ref=YOUR_CODE
  //
  // Make sure your Expo app has a scheme
  // configured in app.json or app.config.js.
  // ==========================================

  const referralLink = referralCode
    ? Linking.createURL('register', {
        queryParams: {
          ref: referralCode,
        },
      })
    : '';

  // ==========================================
  // SHARE MESSAGE
  // ==========================================

  const shareMessage = referralCode
    ? `🎁 Join CoinEarn and start earning coins!

Use my referral code: ${referralCode}

Earn coins by mining and completing tasks.

Join using my referral link:
${referralLink}

Invite your friends and start earning! 🚀`
    : '';

  // ==========================================
  // COPY REFERRAL CODE
  // ==========================================

  const handleCopyReferralCode = async () => {
    if (!referralCode) {
      Alert.alert(
        'Referral Code Unavailable',
        'Your referral code is not available yet. Please try again later.'
      );

      return;
    }

    try {
      await Clipboard.setStringAsync(
        referralCode
      );

      Alert.alert(
        'Copied',
        'Your referral code has been copied successfully.'
      );
    } catch (error) {
      console.error(
        'COPY REFERRAL CODE ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to copy your referral code.'
      );
    }
  };

  // ==========================================
  // COPY REFERRAL LINK
  // ==========================================

  const handleCopyReferralLink = async () => {
    if (!referralLink) {
      Alert.alert(
        'Referral Link Unavailable',
        'Your referral link is not available yet.'
      );

      return;
    }

    try {
      await Clipboard.setStringAsync(
        referralLink
      );

      Alert.alert(
        'Link Copied',
        'Your referral link has been copied successfully.'
      );
    } catch (error) {
      console.error(
        'COPY REFERRAL LINK ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to copy your referral link.'
      );
    }
  };

  // ==========================================
  // SHARE REFERRAL
  // ==========================================
  // Opens the phone's native share menu.
  //
  // Users can choose WhatsApp, Telegram,
  // Facebook, Messenger, X, and other apps
  // installed on their device.
  // ==========================================

  const handleShareReferral = async () => {
    if (!referralCode || !referralLink) {
      Alert.alert(
        'Referral Link Unavailable',
        'Your referral information is not available yet. Please try again later.'
      );

      return;
    }

    try {
      const result = await Share.share(
        {
          title: 'Join CoinEarn',
          message: shareMessage,
          url:
            Platform.OS === 'ios'
              ? referralLink
              : undefined,
        },
        {
          dialogTitle: 'Invite friends to CoinEarn',
        }
      );

      if (
        result.action === Share.sharedAction
      ) {
        console.log(
          'REFERRAL SHARED SUCCESSFULLY'
        );
      }

      if (
        result.action === Share.dismissedAction
      ) {
        console.log(
          'SHARE DIALOG DISMISSED'
        );
      }
    } catch (error) {
      console.error(
        'SHARE REFERRAL ERROR:',
        error
      );

      // Fallback: copy the link if sharing fails
      try {
        await Clipboard.setStringAsync(
          referralLink
        );

        Alert.alert(
          'Link Copied',
          'The share menu could not be opened, so your referral link has been copied. You can now paste it anywhere and share it with your friends.'
        );
      } catch (copyError) {
        console.error(
          'REFERRAL FALLBACK COPY ERROR:',
          copyError
        );

        Alert.alert(
          'Error',
          'Unable to share your referral link. Please try again.'
        );
      }
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Logout',
          style: 'destructive',

          onPress: async () => {
            try {
              await logout();

              router.replace('/login');
            } catch (error) {
              console.error(
                'LOGOUT ERROR:',
                error
              );

              Alert.alert(
                'Error',
                'Unable to logout. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  // ==========================================
  // DISPLAY NAME
  // ==========================================

  const fullName = user
    ? `${user.firstName || ''} ${
        user.lastName || ''
      }`.trim()
    : '';

  // ==========================================
  // UI
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================
            TITLE
        ====================================== */}

        <Text style={styles.title}>
          Profile
        </Text>

        {/* =====================================
            USER CARD
        ====================================== */}

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            {user?.avatarUrl ? (
              <Image
                source={{
                  uri: user.avatarUrl,
                }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons
                name="person"
                size={40}
                color={Colors.white}
              />
            )}
          </View>

          <Text style={styles.userName}>
            {fullName || 'User'}
          </Text>

          <Text style={styles.userSub}>
            {user?.email ||
              'No email available'}
          </Text>

          {user?.phone ? (
            <Text style={styles.phone}>
              {user.phone}
            </Text>
          ) : null}
        </View>

        {/* =====================================
            STATS
        ====================================== */}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {Number(balance || 0).toFixed(1)}
            </Text>

            <Text style={styles.statLabel}>
              Coins
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {completedTasks}
            </Text>

            <Text style={styles.statLabel}>
              Tasks Done
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {referralCount}
            </Text>

            <Text style={styles.statLabel}>
              Referrals
            </Text>
          </View>
        </View>

        {/* =====================================
            REFERRAL PROGRAM
        ====================================== */}

        <Text style={styles.sectionTitle}>
          Referral Program
        </Text>

        <View style={styles.referralCard}>
          {/* REWARD */}

          <View style={styles.rewardBox}>
            <Ionicons
              name="gift"
              size={28}
              color={Colors.primary}
            />

            <View style={styles.rewardTextBox}>
              <Text style={styles.rewardTitle}>
                Earn {REFERRAL_REWARD} Coins
              </Text>

              <Text style={styles.rewardSubtitle}>
                For every successful referral
              </Text>
            </View>
          </View>

          {/* REFERRAL CODE */}

          <Text style={styles.referralLabel}>
            Your Referral Code
          </Text>

          <View style={styles.codeContainer}>
            <Text style={styles.referralCode}>
              {referralCode || 'N/A'}
            </Text>

            <TouchableOpacity
              style={styles.copyIcon}
              onPress={handleCopyReferralCode}
              activeOpacity={0.7}
            >
              <Ionicons
                name="copy-outline"
                size={21}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* REFERRAL STATS */}

          <View style={styles.referralStats}>
            <View style={styles.referralStatBox}>
              <Text style={styles.referralStatNumber}>
                {referralCount}
              </Text>

              <Text style={styles.referralStatLabel}>
                Successful Referrals
              </Text>
            </View>

            <View style={styles.referralDivider} />

            <View style={styles.referralStatBox}>
              <Text style={styles.referralStatNumber}>
                {referralEarnings}
              </Text>

              <Text style={styles.referralStatLabel}>
                Coins Earned
              </Text>
            </View>
          </View>

          {/* REFERRAL LINK */}

          <Text style={styles.referralLabel}>
            Your Referral Link
          </Text>

          <View style={styles.linkContainer}>
            <Text
              style={styles.linkText}
              numberOfLines={1}
            >
              {referralLink ||
                'Generating link...'}
            </Text>

            <TouchableOpacity
              style={styles.copyIcon}
              onPress={handleCopyReferralLink}
              activeOpacity={0.7}
            >
              <Ionicons
                name="copy-outline"
                size={21}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* SHARE */}

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareReferral}
            activeOpacity={0.8}
          >
            <Ionicons
              name="share-social"
              size={20}
              color={Colors.white}
            />

            <Text style={styles.shareBtnText}>
              Invite Friends
            </Text>
          </TouchableOpacity>

          <Text style={styles.referralInfo}>
            Tap "Invite Friends" to share your
            referral link through WhatsApp,
            Facebook, Telegram, Messenger, and
            other available social apps.
          </Text>
        </View>

        {/* =====================================
            SETTINGS
        ====================================== */}

        <Text style={styles.sectionTitle}>
          Settings
        </Text>

        {/* EDIT PROFILE */}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            router.push('/edit-profile')
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color={Colors.primary}
          />

          <Text style={styles.menuText}>
            Edit Profile
          </Text>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.gray}
          />
        </TouchableOpacity>

        {/* NOTIFICATIONS */}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Alert.alert(
              'Notifications',
              'Notification settings will be available soon.'
            );
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={Colors.primary}
          />

          <Text style={styles.menuText}>
            Notifications
          </Text>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.gray}
          />
        </TouchableOpacity>

        {/* HELP */}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Alert.alert(
              'Help & Support',
              'Help and support will be available soon.'
            );
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="help-circle-outline"
            size={22}
            color={Colors.primary}
          />

          <Text style={styles.menuText}>
            Help & Support
          </Text>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.gray}
          />
        </TouchableOpacity>

        {/* =====================================
            ADMIN
        ====================================== */}

        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() =>
            router.push('/admin')
          }
          activeOpacity={0.8}
        >
          <Ionicons
            name="shield-checkmark"
            size={22}
            color={Colors.white}
          />

          <Text style={styles.adminText}>
            Admin Dashboard
          </Text>
        </TouchableOpacity>

        {/* =====================================
            LOGOUT
        ====================================== */}

        <TouchableOpacity
          style={[
            styles.adminBtn,
            styles.logoutBtn,
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={Colors.white}
          />

          <Text style={styles.adminText}>
            Logout
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          CoinEarn v1.0 • Demo
        </Text>
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
    backgroundColor: Colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
  },

  // ==========================================
  // USER CARD
  // ==========================================

  userCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },

  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },

  userSub: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },

  phone: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 3,
  },

  // ==========================================
  // STATS
  // ==========================================

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },

  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.primary,
  },

  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },

  // ==========================================
  // REFERRAL CARD
  // ==========================================

  referralCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
    elevation: 2,
  },

  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },

  rewardTextBox: {
    marginLeft: 12,
    flex: 1,
  },

  rewardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },

  rewardSubtitle: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 3,
  },

  referralLabel: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 7,
  },

  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingLeft: 15,
    marginBottom: 18,
  },

  referralCode: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1.5,
  },

  copyIcon: {
    padding: 13,
  },

  // ==========================================
  // REFERRAL STATS
  // ==========================================

  referralStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 20,
  },

  referralStatBox: {
    flex: 1,
  },

  referralStatNumber: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
  },

  referralStatLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },

  referralDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#CBD5E1',
  },

  // ==========================================
  // REFERRAL LINK
  // ==========================================

  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingLeft: 12,
    marginBottom: 16,
  },

  linkText: {
    flex: 1,
    fontSize: 12,
    color: Colors.gray,
  },

  // ==========================================
  // SHARE BUTTON
  // ==========================================

  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },

  shareBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },

  referralInfo: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 14,
  },

  // ==========================================
  // MENU
  // ==========================================

  menuItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 14,
  },

  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },

  // ==========================================
  // ADMIN / LOGOUT
  // ==========================================

  adminBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },

  logoutBtn: {
    backgroundColor: Colors.danger,
    marginTop: 12,
  },

  adminText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },

  version: {
    textAlign: 'center',
    color: Colors.gray,
    fontSize: 13,
    marginTop: 30,
  },
});
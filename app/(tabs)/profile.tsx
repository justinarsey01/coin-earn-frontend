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

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

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
  // GENERATE REFERRAL LINK
  // ==========================================

  const referralLink = referralCode
    ? Linking.createURL('register', {
        queryParams: {
          ref: referralCode,
        },
      })
    : '';

  // ==========================================
  // COPY REFERRAL CODE
  // ==========================================

  const handleCopyReferralCode = async () => {
    if (!referralCode) {
      Alert.alert(
        'Error',
        'Referral code is not available yet.'
      );

      return;
    }

    try {
      await Clipboard.setStringAsync(
        referralCode
      );

      Alert.alert(
        'Copied',
        'Your referral code has been copied.'
      );

    } catch (error) {
      console.error(
        'COPY REFERRAL CODE ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to copy referral code.'
      );
    }
  };

  // ==========================================
  // COPY REFERRAL LINK
  // ==========================================

  const handleCopyReferralLink = async () => {
    if (!referralLink) {
      Alert.alert(
        'Error',
        'Referral link is not available yet.'
      );

      return;
    }

    try {
      await Clipboard.setStringAsync(
        referralLink
      );

      Alert.alert(
        'Link Copied',
        'Your referral link has been copied.'
      );

    } catch (error) {
      console.error(
        'COPY REFERRAL LINK ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to copy referral link.'
      );
    }
  };

  // ==========================================
  // SHARE REFERRAL
  // ==========================================

  const handleShareReferral = async () => {
    if (!referralCode) {
      Alert.alert(
        'Error',
        'Referral code is not available yet.'
      );

      return;
    }

    try {
      await Linking.openURL(
        `whatsapp://send?text=${encodeURIComponent(
          `🎁 Join CoinEarn and start earning coins!

Use my referral code:

${referralCode}

You can earn coins by mining and completing tasks.

Join here:
${referralLink}

I will receive 150 coins when you register using my referral code.`
        )}`
      );

    } catch (error) {
      console.log(
        'WhatsApp not available, using system share.'
      );

      await Clipboard.setStringAsync(
        referralLink
      );

      Alert.alert(
        'Referral Link Copied',
        `Share this link with your friends:\n\n${referralLink}`
      );
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
                'Logout error:',
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

          {/* PROFILE AVATAR */}

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

          {/* USER NAME */}

          <Text style={styles.userName}>
            {fullName || 'User'}
          </Text>

          {/* EMAIL */}

          <Text style={styles.userSub}>
            {user?.email ||
              'No email available'}
          </Text>

          {/* PHONE */}

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

          {/* COINS */}

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {Number(balance || 0).toFixed(1)}
            </Text>

            <Text style={styles.statLabel}>
              Coins
            </Text>
          </View>

          {/* TASKS */}

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {completedTasks}
            </Text>

            <Text style={styles.statLabel}>
              Tasks Done
            </Text>
          </View>

          {/* REFERRALS */}

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
            REFERRAL SECTION
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

            <View
              style={{
                marginLeft: 12,
              }}
            >
              <Text
                style={
                  styles.rewardTitle
                }
              >
                Earn {REFERRAL_REWARD} Coins
              </Text>

              <Text
                style={
                  styles.rewardSubtitle
                }
              >
                For every successful referral
              </Text>
            </View>

          </View>

          {/* REFERRAL CODE */}

          <Text style={styles.referralLabel}>
            Your Referral Code
          </Text>

          <View
            style={styles.codeContainer}
          >

            <Text
              style={styles.referralCode}
            >
              {referralCode || 'N/A'}
            </Text>

            <TouchableOpacity
              style={styles.copyIcon}
              onPress={
                handleCopyReferralCode
              }
            >
              <Ionicons
                name="copy-outline"
                size={21}
                color={Colors.primary}
              />
            </TouchableOpacity>

          </View>

          {/* REFERRAL COUNT */}

          <View
            style={styles.referralStats}
          >

            <View>
              <Text
                style={
                  styles.referralStatNumber
                }
              >
                {referralCount}
              </Text>

              <Text
                style={
                  styles.referralStatLabel
                }
              >
                Successful Referrals
              </Text>
            </View>

            <View
              style={
                styles.referralDivider
              }
            />

            <View>
              <Text
                style={
                  styles.referralStatNumber
                }
              >
                {referralEarnings}
              </Text>

              <Text
                style={
                  styles.referralStatLabel
                }
              >
                Coins Earned
              </Text>
            </View>

          </View>

          {/* REFERRAL LINK */}

          <Text
            style={styles.referralLabel}
          >
            Your Referral Link
          </Text>

          <View
            style={styles.linkContainer}
          >

            <Text
              style={styles.linkText}
              numberOfLines={1}
            >
              {referralLink ||
                'Generating link...'}
            </Text>

            <TouchableOpacity
              style={styles.copyIcon}
              onPress={
                handleCopyReferralLink
              }
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
            onPress={
              handleShareReferral
            }
          >

            <Ionicons
              name="share-social"
              size={20}
              color={Colors.white}
            />

            <Text
              style={styles.shareBtnText}
            >
              Invite Friends
            </Text>

          </TouchableOpacity>

          {/* INFORMATION */}

          <Text
            style={styles.referralInfo}
          >
            Share your referral link with
            friends. When they create an
            account using your referral code,
            you receive 150 coins.
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

        {/* VERSION */}

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
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
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
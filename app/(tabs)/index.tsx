import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Share,
  Modal,
  Pressable,
} from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';

import { useUser } from '../../context/UserContext';
import { Colors } from '../../constants/Colors';

export default function HomeScreen() {
  const router = useRouter();

  const {
    balance,
    canClaim,
    isBoostActive,
    tasks,
    user,
    lastClaimTime,
    timeLeft,
  } = useUser();

  // ====================================================
  // LIVE CLOCK
  // ====================================================

  const [currentTime, setCurrentTime] =
    useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ====================================================
  // NOTIFICATION STATE
  // ====================================================

  const [notificationsVisible, setNotificationsVisible] =
    useState(false);

  const [readNotifications, setReadNotifications] =
    useState({});

  // ====================================================
  // TASK STATS
  // ====================================================

  const completedTasks =
    tasks?.filter((task) => task.completed).length || 0;

  const totalTasks =
    tasks?.length || 0;

  // ====================================================
  // MINING CONFIGURATION
  // ====================================================

  const DAILY_MINING_REWARD = 10;

  const BOOST_PERCENT = 0.03;

  const MINING_DURATION_MS =
    24 * 60 * 60 * 1000;

  // ====================================================
  // MINING REWARD CALCULATION
  // ====================================================

  const boostReward =
    DAILY_MINING_REWARD * BOOST_PERCENT;

  const dailyMiningReward =
    isBoostActive
      ? DAILY_MINING_REWARD + boostReward
      : DAILY_MINING_REWARD;

  const miningRate =
    dailyMiningReward / 24;

  const miningRatePerMinute =
    dailyMiningReward / (24 * 60);

  // Prevent unused-variable warning if this value is
  // needed later for more detailed mining calculations.
  void miningRatePerMinute;

  // ====================================================
  // MINING PROGRESS + COUNTDOWN
  // ====================================================

  let miningProgress = 0;
  let remainingTimeText = 'Ready to start';
  let currentMinedCoins = 0;

  if (canClaim) {
    miningProgress = 100;

    currentMinedCoins =
      dailyMiningReward;

    remainingTimeText =
      'Ready to claim';
  } else if (lastClaimTime) {
    const miningStartTime =
      Number(lastClaimTime);

    const elapsedTime = Math.max(
      0,
      currentTime - miningStartTime
    );

    miningProgress = Math.min(
      100,
      (elapsedTime / MINING_DURATION_MS) * 100
    );

    currentMinedCoins =
      dailyMiningReward *
      (miningProgress / 100);

    const remainingMs = Math.max(
      0,
      MINING_DURATION_MS - elapsedTime
    );

    const totalRemainingSeconds =
      Math.ceil(remainingMs / 1000);

    const hours = Math.floor(
      totalRemainingSeconds / 3600
    );

    const minutes = Math.floor(
      (totalRemainingSeconds % 3600) / 60
    );

    const seconds =
      totalRemainingSeconds % 60;

    remainingTimeText =
      `${hours}h ${minutes}m ${seconds}s remaining`;
  } else if (typeof timeLeft === 'number') {
    const safeTimeLeft = Math.max(
      0,
      timeLeft
    );

    const elapsedSeconds =
      Math.max(
        0,
        24 * 60 * 60 - safeTimeLeft
      );

    miningProgress =
      Math.min(
        100,
        (elapsedSeconds / (24 * 60 * 60)) * 100
      );

    currentMinedCoins =
      dailyMiningReward *
      (miningProgress / 100);

    const hours = Math.floor(
      safeTimeLeft / 3600
    );

    const minutes = Math.floor(
      (safeTimeLeft % 3600) / 60
    );

    const seconds =
      safeTimeLeft % 60;

    remainingTimeText =
      `${hours}h ${minutes}m ${seconds}s remaining`;
  }

  // ====================================================
  // REFERRAL DATA
  // ====================================================

  const REFERRAL_REWARD = 150;

  const referralCode =
    user?.referralCode || '';

  const referralLink =
    referralCode
      ? Linking.createURL('register', {
          queryParams: {
            ref: referralCode,
          },
        })
      : '';

  // ====================================================
  // NOTIFICATIONS
  // ====================================================

  /*
   * These notifications are generated from the current
   * HomeScreen/UserContext state.
   *
   * They do not require a backend notification table.
   */

  const notifications = useMemo(() => {
    const notificationList = [];

    // --------------------------------------------------
    // MINING READY
    // --------------------------------------------------

    if (canClaim) {
      notificationList.push({
        id: 'mining-ready',
        icon: 'gift',
        iconColor: Colors.success,
        iconBackground: '#DCFCE7',
        title: 'Mining reward ready',
        message: `Your ${dailyMiningReward.toFixed(
          2
        )} coin mining reward is ready to claim.`,
        time: 'Now',
        priority: 'high',
      });
    } else if (lastClaimTime) {
      // ------------------------------------------------
      // MINING IN PROGRESS
      // ------------------------------------------------

      notificationList.push({
        id: 'mining-progress',
        icon: 'flash',
        iconColor: Colors.primary,
        iconBackground: '#DBEAFE',
        title: 'Mining in progress',
        message: `${currentMinedCoins.toFixed(
          4
        )} coins mined so far.`,
        time: remainingTimeText,
        priority: 'normal',
      });
    }

    // --------------------------------------------------
    // BOOST
    // --------------------------------------------------

    if (isBoostActive) {
      notificationList.push({
        id: 'boost-active',
        icon: 'rocket',
        iconColor: '#D97706',
        iconBackground: '#FEF3C7',
        title: '3% mining boost active',
        message: `You are earning ${boostReward.toFixed(
          2
        )} extra coins on your daily mining reward.`,
        time: 'Active',
        priority: 'high',
      });
    }

    // --------------------------------------------------
    // TASKS
    // --------------------------------------------------

    if (completedTasks > 0) {
      notificationList.push({
        id: 'tasks-completed',
        icon: 'checkmark-circle',
        iconColor: Colors.success,
        iconBackground: '#DCFCE7',
        title: 'Tasks completed',
        message: `You have completed ${completedTasks} ${
          completedTasks === 1
            ? 'task'
            : 'tasks'
        }. Keep earning!`,
        time: 'Today',
        priority: 'normal',
      });
    }

    // --------------------------------------------------
    // REFERRAL
    // --------------------------------------------------

    if (referralCode) {
      notificationList.push({
        id: 'referral',
        icon: 'people',
        iconColor: '#7C3AED',
        iconBackground: '#EDE9FE',
        title: 'Invite friends & earn',
        message: `Earn up to ${REFERRAL_REWARD} coins for every successful referral.`,
        time: 'Available',
        priority: 'normal',
      });
    }

    // --------------------------------------------------
    // WELCOME / GENERAL
    // --------------------------------------------------

    if (notificationList.length === 0) {
      notificationList.push({
        id: 'welcome',
        icon: 'sparkles',
        iconColor: Colors.primary,
        iconBackground: '#DBEAFE',
        title: 'Welcome to CoinEarn',
        message:
          'Start mining and completing tasks to earn coins.',
        time: 'Now',
        priority: 'normal',
      });
    }

    return notificationList;
  }, [
    canClaim,
    dailyMiningReward,
    lastClaimTime,
    currentMinedCoins,
    remainingTimeText,
    isBoostActive,
    boostReward,
    completedTasks,
    referralCode,
  ]);

  // ====================================================
  // UNREAD NOTIFICATIONS
  // ====================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !readNotifications[notification.id]
    ).length;

  const hasUnreadNotifications =
    unreadCount > 0;

  // ====================================================
  // NOTIFICATION ACTIONS
  // ====================================================

  const openNotifications = () => {
    setNotificationsVisible(true);
  };

  const closeNotifications = () => {
    setNotificationsVisible(false);
  };

  const markNotificationAsRead = (
    notificationId
  ) => {
    setReadNotifications((previous) => ({
      ...previous,
      [notificationId]: true,
    }));
  };

  const markAllNotificationsAsRead = () => {
    const updatedReadState = {};

    notifications.forEach(
      (notification) => {
        updatedReadState[notification.id] =
          true;
      }
    );

    setReadNotifications(
      updatedReadState
    );
  };

  const handleNotificationPress = (
    notification
  ) => {
    markNotificationAsRead(
      notification.id
    );

    if (
      notification.id ===
      'mining-ready'
    ) {
      closeNotifications();
      router.push('/mine');
      return;
    }

    if (
      notification.id ===
      'mining-progress'
    ) {
      closeNotifications();
      router.push('/mine');
      return;
    }

    if (
      notification.id ===
      'tasks-completed'
    ) {
      closeNotifications();
      router.push('/task');
      return;
    }

    if (
      notification.id ===
      'referral'
    ) {
      closeNotifications();

      if (referralCode) {
        handleInvite();
      }

      return;
    }

    if (
      notification.id ===
      'boost-active'
    ) {
      closeNotifications();
      router.push('/mine');
    }
  };

  // ====================================================
  // ACTIONS
  // ====================================================

  const handleMine = () => {
    router.push('/mine');
  };

  const handleTasks = () => {
    router.push('/task');
  };

  const handleWallet = () => {
    router.push('/wallet');
  };

  // ====================================================
  // SHARE REFERRAL
  // ====================================================

  const handleInvite = async () => {
    if (!referralCode || !referralLink) {
      Alert.alert(
        'Referral Unavailable',
        'Your referral information is not available yet. Please try again shortly.'
      );

      return;
    }

    const message = `🎁 Join CoinEarn and start earning coins!

Use my referral code: ${referralCode}

Mine coins, complete tasks, and earn rewards.

Join using my referral link:
${referralLink}

Invite friends and earn up to ${REFERRAL_REWARD} coins per successful referral! 🚀`;

    try {
      const result =
        await Share.share({
          title: 'Join CoinEarn',
          message,
        });

      if (
        result.action ===
        Share.dismissedAction
      ) {
        console.log(
          'Share sheet was dismissed'
        );
      }
    } catch (error) {
      console.error(
        'SHARE REFERRAL ERROR:',
        error
      );

      try {
        await Clipboard.setStringAsync(
          referralLink
        );

        Alert.alert(
          'Link Copied',
          `Unable to open the share menu, but your referral link has been copied:\n\n${referralLink}`
        );
      } catch (clipboardError) {
        console.error(
          'COPY REFERRAL LINK ERROR:',
          clipboardError
        );

        Alert.alert(
          'Error',
          'Unable to share your referral link. Please try again.'
        );
      }
    }
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              Welcome back 👋
            </Text>

            <Text style={styles.appName}>
              CoinEarn
            </Text>
          </View>

          {/* ==================================================
              NOTIFICATION BUTTON
          ================================================== */}

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={openNotifications}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications-outline"
              size={23}
              color={Colors.text}
            />

            {hasUnreadNotifications && (
              <View
                style={
                  styles.notificationDot
                }
              />
            )}

            {unreadCount > 1 && (
              <View
                style={
                  styles.notificationCount
                }
              >
                <Text
                  style={
                    styles.notificationCountText
                  }
                >
                  {unreadCount > 9
                    ? '9+'
                    : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ==================================================
            BALANCE CARD
        ================================================== */}

        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <View>
              <Text style={styles.balanceLabel}>
                TOTAL BALANCE
              </Text>

              <Text style={styles.balanceValue}>
                {Number(
                  balance || 0
                ).toFixed(2)}
              </Text>

              <Text style={styles.balanceUnit}>
                COINS
              </Text>
            </View>

            <View style={styles.coinIcon}>
              <Ionicons
                name="flash"
                size={26}
                color={Colors.white}
              />
            </View>
          </View>

          <View style={styles.rateContainer}>
            <View style={styles.rateIcon}>
              <Ionicons
                name="speedometer-outline"
                size={17}
                color={Colors.white}
              />
            </View>

            <Text style={styles.rateText}>
              Mining rate
            </Text>

            <Text style={styles.rateValue}>
              +{miningRate.toFixed(4)} COIN/hour
            </Text>
          </View>

          <Text style={styles.dailyRateText}>
            {isBoostActive
              ? `Boost active: ${dailyMiningReward.toFixed(
                  2
                )} COINS / 24 hours`
              : `${DAILY_MINING_REWARD.toFixed(
                  2
                )} COINS / 24 hours`}
          </Text>

          <TouchableOpacity
            style={styles.mineButton}
            onPress={handleMine}
            activeOpacity={0.85}
          >
            <Ionicons
              name="flash"
              size={20}
              color={Colors.primary}
            />

            <Text style={styles.mineButtonText}>
              {canClaim
                ? 'MINE NOW'
                : 'VIEW MINING'}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* ==================================================
            MINING PROGRESS
        ================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Mining Progress
          </Text>

          <TouchableOpacity
            onPress={handleMine}
          >
            <Text style={styles.viewText}>
              View
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View
              style={
                styles.progressIconContainer
              }
            >
              <Ionicons
                name="flash"
                size={22}
                color={Colors.primary}
              />
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                Daily Mining Session
              </Text>

              <Text
                style={styles.progressSubtitle}
              >
                {canClaim
                  ? 'Your reward is ready to claim'
                  : 'Mining session in progress'}
              </Text>
            </View>

            <Text
              style={styles.progressPercent}
            >
              {miningProgress.toFixed(2)}%
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    `${miningProgress}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressBottom}>
            <View
              style={styles.timeContainer}
            >
              <Ionicons
                name={
                  canClaim
                    ? 'checkmark-circle'
                    : 'time-outline'
                }
                size={17}
                color={
                  canClaim
                    ? Colors.success
                    : Colors.gray
                }
              />

              <Text style={styles.timeText}>
                {remainingTimeText}
              </Text>
            </View>

            <Text
              style={styles.progressReward}
            >
              +{currentMinedCoins.toFixed(4)}
            </Text>
          </View>

          <View style={styles.miningAmountRow}>
            <Text
              style={styles.miningAmountLabel}
            >
              Mined so far
            </Text>

            <Text
              style={styles.miningAmountValue}
            >
              {currentMinedCoins.toFixed(4)}
              {' / '}
              {dailyMiningReward.toFixed(2)}
              {' COINS'}
            </Text>
          </View>
        </View>

        {/* ==================================================
            YOUR STATS
        ================================================== */}

        <Text style={styles.sectionTitle}>
          Your Stats
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.blueIcon,
              ]}
            >
              <Ionicons
                name="checkmark-done"
                size={20}
                color={Colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {completedTasks}/{totalTasks}
            </Text>

            <Text style={styles.statLabel}>
              Tasks
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.orangeIcon,
              ]}
            >
              <Ionicons
                name="rocket"
                size={20}
                color="#D97706"
              />
            </View>

            <Text style={styles.statValue}>
              {isBoostActive
                ? 'ON'
                : 'OFF'}
            </Text>

            <Text style={styles.statLabel}>
              3% Boost
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                canClaim
                  ? styles.greenIcon
                  : styles.grayIcon,
              ]}
            >
              <Ionicons
                name={
                  canClaim
                    ? 'gift'
                    : 'time-outline'
                }
                size={20}
                color={
                  canClaim
                    ? Colors.success
                    : Colors.gray
                }
              />
            </View>

            <Text style={styles.statValue}>
              {canClaim
                ? 'READY'
                : 'WAIT'}
            </Text>

            <Text style={styles.statLabel}>
              Claim
            </Text>
          </View>
        </View>

        {/* ==================================================
            DAILY REWARD
        ================================================== */}

        <View style={styles.rewardCard}>
          <View style={styles.rewardIcon}>
            <Ionicons
              name="gift"
              size={26}
              color="#D97706"
            />
          </View>

          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>
              Daily Reward
            </Text>

            <Text
              style={styles.rewardDescription}
            >
              Mine {DAILY_MINING_REWARD} coins
              every 24 hours
              {isBoostActive
                ? ` + ${boostReward.toFixed(
                    2
                  )} boost bonus`
                : ''}.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.rewardButton}
            onPress={handleMine}
            activeOpacity={0.8}
          >
            <Text
              style={styles.rewardButtonText}
            >
              {canClaim
                ? 'CLAIM'
                : 'VIEW'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ==================================================
            REFERRAL
        ================================================== */}

        <View style={styles.referralCard}>
          <View style={styles.referralIcon}>
            <Ionicons
              name="people"
              size={26}
              color={Colors.primary}
            />
          </View>

          <View style={styles.referralInfo}>
            <Text style={styles.referralTitle}>
              Invite & Earn
            </Text>

            <Text
              style={styles.referralDescription}
            >
              Invite friends and earn coins when
              they join CoinEarn.
            </Text>

            <Text
              style={styles.referralReward}
            >
              +{REFERRAL_REWARD} COINS per referral
            </Text>
          </View>

          <TouchableOpacity
            style={styles.inviteButton}
            onPress={handleInvite}
            activeOpacity={0.8}
          >
            <Ionicons
              name="share-social"
              size={17}
              color={Colors.white}
            />

            <Text style={styles.inviteText}>
              Invite
            </Text>
          </TouchableOpacity>
        </View>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleTasks}
          activeOpacity={0.8}
        >
          <View style={styles.actionLeft}>
            <View
              style={[
                styles.actionIcon,
                styles.blueIcon,
              ]}
            >
              <Ionicons
                name="checkbox"
                size={22}
                color={Colors.primary}
              />
            </View>

            <View
              style={styles.actionTextContainer}
            >
              <Text style={styles.actionTitle}>
                Complete Tasks
              </Text>

              <Text
                style={styles.actionDescription}
              >
                Earn extra coins by completing tasks
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={Colors.gray}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleWallet}
          activeOpacity={0.8}
        >
          <View style={styles.actionLeft}>
            <View
              style={[
                styles.actionIcon,
                styles.greenIcon,
              ]}
            >
              <Ionicons
                name="wallet"
                size={22}
                color={Colors.success}
              />
            </View>

            <View
              style={styles.actionTextContainer}
            >
              <Text style={styles.actionTitle}>
                Wallet
              </Text>

              <Text
                style={styles.actionDescription}
              >
                Swap coins for airtime, data and USDT
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={Colors.gray}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleMine}
          activeOpacity={0.8}
        >
          <View style={styles.actionLeft}>
            <View
              style={[
                styles.actionIcon,
                styles.orangeIcon,
              ]}
            >
              <Ionicons
                name="flash"
                size={22}
                color="#D97706"
              />
            </View>

            <View
              style={styles.actionTextContainer}
            >
              <Text style={styles.actionTitle}>
                Mining
              </Text>

              <Text
                style={styles.actionDescription}
              >
                Earn 10 coins every 24 hours
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={Colors.gray}
          />
        </TouchableOpacity>

        {/* ==================================================
            ACTIVITY
        ================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent Activity
          </Text>

          <TouchableOpacity>
            <Text style={styles.viewText}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          <View
            style={[
              styles.activityIcon,
              styles.blueIcon,
            ]}
          >
            <Ionicons
              name="flash"
              size={20}
              color={Colors.primary}
            />
          </View>

          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>
              Mining Reward
            </Text>

            <Text style={styles.activityTime}>
              {isBoostActive
                ? '3% mining boost active'
                : 'Daily mining'}
            </Text>
          </View>

          <Text
            style={styles.activityAmount}
          >
            +{currentMinedCoins.toFixed(4)}
          </Text>
        </View>

        <View style={styles.activityCard}>
          <View
            style={[
              styles.activityIcon,
              styles.greenIcon,
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={Colors.success}
            />
          </View>

          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>
              Tasks Completed
            </Text>

            <Text style={styles.activityTime}>
              {completedTasks} completed
            </Text>
          </View>

          <Text
            style={styles.activityAmount}
          >
            +{completedTasks * 5}
          </Text>
        </View>

        <View style={styles.activityCard}>
          <View
            style={[
              styles.activityIcon,
              styles.purpleIcon,
            ]}
          >
            <Ionicons
              name="people"
              size={20}
              color="#7C3AED"
            />
          </View>

          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>
              Referral Rewards
            </Text>

            <Text style={styles.activityTime}>
              Invite friends to earn
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleInvite}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={Colors.gray}
          />

          <Text style={styles.footerText}>
            Your earnings are securely stored
          </Text>
        </View>
      </ScrollView>

      {/* ====================================================
          NOTIFICATION MODAL
      ==================================================== */}

      <Modal
        visible={notificationsVisible}
        transparent
        animationType="fade"
        onRequestClose={
          closeNotifications
        }
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeNotifications}
          />

          <View
            style={styles.notificationModal}
          >
            {/* ==============================================
                NOTIFICATION HEADER
            ============================================== */}

            <View
              style={
                styles.notificationHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.notificationTitle
                  }
                >
                  Notifications
                </Text>

                <Text
                  style={
                    styles.notificationSubtitle
                  }
                >
                  {unreadCount > 0
                    ? `${unreadCount} unread ${
                        unreadCount === 1
                          ? 'notification'
                          : 'notifications'
                      }`
                    : 'All notifications read'}
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.notificationCloseButton
                }
                onPress={
                  closeNotifications
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={Colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* ==============================================
                MARK ALL AS READ
            ============================================== */}

            {unreadCount > 0 && (
              <TouchableOpacity
                style={
                  styles.markAllButton
                }
                onPress={
                  markAllNotificationsAsRead
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark-done"
                  size={17}
                  color={Colors.primary}
                />

                <Text
                  style={
                    styles.markAllText
                  }
                >
                  Mark all as read
                </Text>
              </TouchableOpacity>
            )}

            {/* ==============================================
                NOTIFICATION LIST
            ============================================== */}

            <ScrollView
              style={
                styles.notificationList
              }
              contentContainerStyle={
                styles.notificationListContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {notifications.map(
                (notification) => {
                  const isRead =
                    !!readNotifications[
                      notification.id
                    ];

                  return (
                    <TouchableOpacity
                      key={
                        notification.id
                      }
                      style={[
                        styles.notificationItem,
                        !isRead &&
                          styles.unreadNotificationItem,
                      ]}
                      onPress={() =>
                        handleNotificationPress(
                          notification
                        )
                      }
                      activeOpacity={0.75}
                    >
                      {/* ICON */}

                      <View
                        style={[
                          styles.notificationItemIcon,
                          {
                            backgroundColor:
                              notification.iconBackground,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            notification.icon
                          }
                          size={21}
                          color={
                            notification.iconColor
                          }
                        />
                      </View>

                      {/* CONTENT */}

                      <View
                        style={
                          styles.notificationItemContent
                        }
                      >
                        <View
                          style={
                            styles.notificationItemTop
                          }
                        >
                          <Text
                            style={[
                              styles.notificationItemTitle,
                              !isRead &&
                                styles.unreadNotificationTitle,
                            ]}
                            numberOfLines={1}
                          >
                            {
                              notification.title
                            }
                          </Text>

                          {!isRead && (
                            <View
                              style={
                                styles.unreadSmallDot
                              }
                            />
                          )}
                        </View>

                        <Text
                          style={
                            styles.notificationItemMessage
                          }
                        >
                          {
                            notification.message
                          }
                        </Text>

                        <Text
                          style={
                            styles.notificationItemTime
                          }
                        >
                          {
                            notification.time
                          }
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={Colors.gray}
                      />
                    </TouchableOpacity>
                  );
                }
              )}

              {/* ==========================================
                  EMPTY / END MESSAGE
              ========================================== */}

              <View
                style={
                  styles.notificationFooter
                }
              >
                <Ionicons
                  name="notifications-off-outline"
                  size={17}
                  color={Colors.gray}
                />

                <Text
                  style={
                    styles.notificationFooterText
                  }
                >
                  You're all caught up
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  scroll: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  headerLeft: {
    flex: 1,
  },

  greeting: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 3,
  },

  appName: {
    fontSize: 27,
    fontWeight: '800',
    color: Colors.text,
  },

  // ====================================================
  // NOTIFICATION BUTTON
  // ====================================================

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },

  notificationCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },

  notificationCountText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '900',
  },

  // ====================================================
  // NOTIFICATION MODAL
  // ====================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(15,23,42,0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },

  notificationModal: {
    width: '92%',
    maxHeight: '82%',
    backgroundColor: Colors.white,
    borderRadius: 22,
    marginTop: 70,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },

  notificationHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  notificationTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },

  notificationSubtitle: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 3,
  },

  notificationCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },

  markAllText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  notificationList: {
    flexGrow: 0,
  },

  notificationListContent: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },

  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  unreadNotificationItem: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },

  notificationItemIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationItemContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  notificationItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationItemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },

  unreadNotificationTitle: {
    fontWeight: '900',
  },

  unreadSmallDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginLeft: 6,
  },

  notificationItemMessage: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.gray,
    marginTop: 3,
  },

  notificationItemTime: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 5,
  },

  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    paddingBottom: 8,
  },

  notificationFooterText: {
    color: Colors.gray,
    fontSize: 10,
    fontWeight: '600',
  },

  // ====================================================
  // BALANCE CARD
  // ====================================================

  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 22,
    marginBottom: 28,
    elevation: 7,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },

  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  balanceLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  balanceValue: {
    color: Colors.white,
    fontSize: 40,
    fontWeight: '900',
    marginTop: 7,
  },

  balanceUnit: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '700',
    marginTop: -2,
  },

  coinIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor:
      'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 19,
  },

  rateIcon: {
    marginRight: 7,
  },

  rateText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
  },

  rateValue: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 5,
  },

  dailyRateText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 7,
    fontWeight: '600',
  },

  mineButton: {
    backgroundColor: Colors.white,
    minHeight: 52,
    borderRadius: 14,
    marginTop: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 9,
  },

  mineButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
  },

  // ====================================================
  // SECTIONS
  // ====================================================

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 13,
  },

  viewText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  // ====================================================
  // PROGRESS
  // ====================================================

  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 17,
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressInfo: {
    flex: 1,
    marginLeft: 12,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },

  progressSubtitle: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 3,
  },

  progressPercent: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },

  progressBar: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 17,
  },

  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },

  progressBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 11,
  },

  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },

  timeText: {
    color: Colors.gray,
    fontSize: 12,
  },

  progressReward: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '800',
  },

  miningAmountRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  miningAmountLabel: {
    color: Colors.gray,
    fontSize: 11,
    fontWeight: '600',
  },

  miningAmountValue: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '800',
  },

  // ====================================================
  // STATS
  // ====================================================

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 13,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 7,
  },

  statLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
  },

  blueIcon: {
    backgroundColor: '#DBEAFE',
  },

  greenIcon: {
    backgroundColor: '#DCFCE7',
  },

  orangeIcon: {
    backgroundColor: '#FEF3C7',
  },

  grayIcon: {
    backgroundColor: '#F1F5F9',
  },

  purpleIcon: {
    backgroundColor: '#EDE9FE',
  },

  // ====================================================
  // DAILY REWARD
  // ====================================================

  rewardCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  rewardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rewardInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  rewardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },

  rewardDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.gray,
    marginTop: 3,
  },

  rewardButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },

  rewardButtonText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '900',
  },

  // ====================================================
  // REFERRAL
  // ====================================================

  referralCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  referralIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  referralInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  referralTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },

  referralDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.gray,
    marginTop: 3,
  },

  referralReward: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 5,
  },

  inviteButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  inviteText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
  },

  // ====================================================
  // QUICK ACTIONS
  // ====================================================

  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },

  actionDescription: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 3,
  },

  // ====================================================
  // ACTIVITY
  // ====================================================

  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },

  activityIcon: {
    width: 41,
    height: 41,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },

  activityTime: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 3,
  },

  activityAmount: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '800',
  },

  // ====================================================
  // FOOTER
  // ====================================================

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 25,
  },

  footerText: {
    color: Colors.gray,
    fontSize: 11,
  },
});

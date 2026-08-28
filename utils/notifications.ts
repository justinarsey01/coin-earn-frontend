import * as Notifications from 'expo-notifications';

import {
  Platform,
} from 'react-native';

import Constants from 'expo-constants';


// ======================================================
// NOTIFICATION HANDLER
// ======================================================

Notifications.setNotificationHandler({
  handleNotification:
    async () => ({
      shouldShowBanner:
        true,

      shouldShowList:
        true,

      shouldPlaySound:
        true,

      shouldSetBadge:
        false,
    }),
});


// ======================================================
// ANDROID CHANNELS
// ======================================================

const setupNotificationChannels =
  async (): Promise<void> => {
    if (
      Platform.OS !==
      'android'
    ) {
      return;
    }


    // ==================================================
    // MINING
    // ==================================================

    await Notifications.setNotificationChannelAsync(
      'mining',
      {
        name:
          'Mining Reminders',

        importance:
          Notifications
            .AndroidImportance
            .DEFAULT,

        vibrationPattern:
          [
            0,
            250,
            250,
            250,
          ],

        sound:
          'default',
      },
    );


    // ==================================================
    // COIN TRANSFERS
    // ==================================================

    await Notifications.setNotificationChannelAsync(
      'coin-transfers',
      {
        name:
          'Coin Transfers',

        importance:
          Notifications
            .AndroidImportance
            .HIGH,

        vibrationPattern:
          [
            0,
            250,
            250,
            250,
          ],

        sound:
          'default',

        enableVibrate:
          true,

        showBadge:
          true,
      },
    );


    // ==================================================
    // GENERAL
    // ==================================================

    await Notifications.setNotificationChannelAsync(
      'general',
      {
        name:
          'General Notifications',

        importance:
          Notifications
            .AndroidImportance
            .DEFAULT,

        vibrationPattern:
          [
            0,
            250,
            250,
            250,
          ],

        sound:
          'default',
      },
    );
  };


// ======================================================
// REQUEST PERMISSION
// ======================================================

export const requestNotificationPermission =
  async (): Promise<boolean> => {
    try {
      await setupNotificationChannels();


      const {
        status:
          existingStatus,
      } =
        await Notifications.getPermissionsAsync();


      let finalStatus =
        existingStatus;


      if (
        existingStatus !==
        'granted'
      ) {
        const {
          status,
        } =
          await Notifications.requestPermissionsAsync();

        finalStatus =
          status;
      }


      if (
        finalStatus !==
        'granted'
      ) {
        console.log(
          'NOTIFICATION PERMISSION NOT GRANTED',
        );

        return false;
      }


      console.log(
        'NOTIFICATION PERMISSION GRANTED',
      );

      return true;
    } catch (error) {
      console.error(
        'NOTIFICATION PERMISSION ERROR:',
        error,
      );

      return false;
    }
  };


// ======================================================
// GET EXPO PUSH TOKEN
// ======================================================

export const getExpoPushToken =
  async (): Promise<
    string | null
  > => {
    try {
      const permission =
        await requestNotificationPermission();


      if (!permission) {
        return null;
      }


      const projectId =
        Constants
          ?.expoConfig
          ?.extra
          ?.eas
          ?.projectId ||
        Constants
          ?.easConfig
          ?.projectId;


      console.log(
        'EXPO PROJECT ID:',
        projectId,
      );


      let tokenResponse;


      if (projectId) {
        tokenResponse =
          await Notifications.getExpoPushTokenAsync({
            projectId,
          });
      } else {
        tokenResponse =
          await Notifications.getExpoPushTokenAsync();
      }


      const token =
        tokenResponse?.data;


      console.log(
        'EXPO PUSH TOKEN:',
        token,
      );


      return token || null;
    } catch (error) {
      console.error(
        'GET EXPO PUSH TOKEN ERROR:',
        error,
      );

      return null;
    }
  };


// ======================================================
// COMPATIBILITY FUNCTION
// ======================================================

export const registerForPushNotificationsAsync =
  async (): Promise<boolean> => {
    const permission =
      await requestNotificationPermission();

    return permission;
  };


// ======================================================
// SHOW LOCAL COIN RECEIVED NOTIFICATION
// ======================================================

export const showCoinReceivedNotification =
  async (
    amount: number,
    senderWalletAddress: string,
  ): Promise<void> => {
    try {
      const permission =
        await requestNotificationPermission();


      if (!permission) {
        return;
      }


      await Notifications.scheduleNotificationAsync({
        content: {
          title:
            '💰 Coins Received',

          body:
            `You received ${amount} coins from ${senderWalletAddress}`,

          sound:
            'default',

          data: {
            type:
              'coin_received',

            amount,

            senderWalletAddress,
          },
        },

        trigger:
          null,
      });
    } catch (error) {
      console.error(
        'COIN RECEIVED LOCAL NOTIFICATION ERROR:',
        error,
      );
    }
  };


// ======================================================
// SCHEDULE MINING REMINDER
// ======================================================

export const scheduleMiningReminder =
  async (): Promise<void> => {
    try {
      const permission =
        await requestNotificationPermission();


      if (!permission) {
        console.log(
          'NOTIFICATION PERMISSION DENIED',
        );

        return;
      }


      // ==================================================
      // CANCEL PREVIOUS MINING REMINDERS
      // ==================================================

      const scheduled =
        await Notifications.getAllScheduledNotificationsAsync();


      for (
        const notification of scheduled
      ) {
        const data =
          notification.content
            .data;


        if (
          data &&
          (
            data as any
          ).type ===
            'mining-reminder'
        ) {
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier,
          );
        }
      }


      // ==================================================
      // 24 HOURS
      // ==================================================

      const seconds =
        24 *
        60 *
        60;


      console.log(
        'SCHEDULING MINING REMINDER:',
        seconds,
      );


      const notificationId =
        await Notifications.scheduleNotificationAsync({
          content: {
            title:
              '⛏️ CoinEarn Mining',

            body:
              'Your mining reward is ready! Open CoinEarn and claim your coins.',

            sound:
              'default',

            data: {
              type:
                'mining-reminder',
            },
          },

          trigger: {
            type:
              Notifications
                .SchedulableTriggerInputTypes
                .TIME_INTERVAL,

            seconds,

            repeats:
              false,

            ...(Platform.OS ===
            'android'
              ? {
                  channelId:
                    'mining',
                }
              : {}),
          },
        });


      console.log(
        'MINING REMINDER SCHEDULED:',
        notificationId,
      );
    } catch (error) {
      console.error(
        'SCHEDULE MINING REMINDER ERROR:',
        error,
      );
    }
  };
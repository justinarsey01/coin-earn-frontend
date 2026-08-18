import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ======================================================
// NOTIFICATION HANDLER
// ======================================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ======================================================
// REQUEST PERMISSION
// ======================================================

export const requestNotificationPermission =
  async (): Promise<boolean> => {
    try {
      // Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(
          'mining',
          {
            name: 'Mining Reminders',
            importance:
              Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
          }
        );
      }

      const {
        status: existingStatus,
      } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } =
          await Notifications.requestPermissionsAsync();

        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log(
          'Notification permission not granted'
        );

        return false;
      }

      console.log(
        'Notification permission granted'
      );

      return true;

    } catch (error) {
      console.error(
        'Notification permission error:',
        error
      );

      return false;
    }
  };

// ======================================================
// COMPATIBILITY FUNCTION
// ======================================================

export const registerForPushNotificationsAsync =
  async (): Promise<boolean> => {
    return await requestNotificationPermission();
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
          'Notification permission denied'
        );

        return;
      }

      // ==================================================
      // CANCEL PREVIOUS MINING REMINDERS
      // ==================================================

      const scheduled =
        await Notifications.getAllScheduledNotificationsAsync();

      for (const notification of scheduled) {

        const data =
          notification.content.data;

        if (
          data &&
          (data as any).type ===
            'mining-reminder'
        ) {
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          );
        }
      }

      // ==================================================
      // SCHEDULE 24 HOURS FROM NOW
      // ==================================================

      const seconds =
        24 * 60 * 60;

      console.log(
        'Scheduling mining reminder in:',
        seconds,
        'seconds'
      );

      const notificationId =
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⛏️ CoinEarn Mining',

            body:
              'Your mining reward is ready! Open CoinEarn and claim your coins.',

            sound: 'default',

            data: {
              type: 'mining-reminder',
            },
          },

          trigger: {
            type:
              Notifications
                .SchedulableTriggerInputTypes
                .TIME_INTERVAL,

            seconds,

            repeats: false,

            ...(Platform.OS === 'android'
              ? {
                  channelId: 'mining',
                }
              : {}),
          },
        });

      console.log(
        'MINING REMINDER SCHEDULED:',
        notificationId
      );

    } catch (error) {

      console.error(
        'SCHEDULE MINING REMINDER ERROR:',
        error
      );

    }
  };
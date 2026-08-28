import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  scheduleMiningReminder,
  getExpoPushToken,
} from '../utils/notifications';

import {
  apiRequest,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../services/api';

// ======================================================
// MINING CONSTANTS
// ======================================================

const MINING_DURATION_MS =
  24 * 60 * 60 * 1000;

const BASE_MINING_REWARD = 10;

const BOOST_PERCENT = 0.03;

const BOOST_REWARD =
  BASE_MINING_REWARD *
  BOOST_PERCENT;

const BOOSTED_MINING_REWARD =
  BASE_MINING_REWARD +
  BOOST_REWARD;

  

// ======================================================
// TYPES
// ======================================================

export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  started: boolean;
  startedAt: number | null;
  reward: number;
};

export type Transaction = {
  id: string;

  type:
    | 'mine'
    | 'task'
    | 'swap'
    | 'transfer'
    | 'sent'
    | 'received'
    | 'referral'
    | 'bonus'
    | 'other';

  amount: number;

  description: string;

  date: number;
};

export type UserInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  userId: string;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  avatarUrl: string | null;
};

// ======================================================
// USER CONTEXT TYPE
// ======================================================

type UserContextType = {
  isLoggedIn: boolean;

  user: UserInfo | null;
registerPushNotificationDevice:
  () => Promise<void>;
  // ====================================================
  // WALLET
  // ====================================================

  balance: number;

  walletAddress: string | null;

  refreshWallet: () => Promise<void>;

  transferCoins: (
    walletAddress: string,
    amount: number,
  ) => Promise<void>;

  notifications: any[];

unreadNotificationCount: number;

refreshNotifications:
  () => Promise<void>;

markNotificationAsRead:
  (notificationId: string) =>
    Promise<void>;

markAllNotificationsAsRead:
  () => Promise<void>;

  // ====================================================
  // MINING
  // ====================================================

  lastClaimTime: number | null;

  boostEndTime: number | null;

  canClaim: boolean;

  timeLeft: number;

  claimReward: () => Promise<void>;

  miningReward: number;

  miningRate: number;

  boostMultiplier: number;

  nextClaimAt: string | null;

  fetchMiningStatus: () => Promise<void>;

  // ====================================================
  // BOOST
  // ====================================================

  isBoostActive: boolean;

  boostTimeLeft: number;

  activateBoost: () => void;

  // ====================================================
  // TASKS
  // ====================================================

  tasks: Task[];

  completeTask: (
    taskId: string,
  ) => Promise<void>;

  startTask: (
    taskId: string,
  ) => Promise<void>;

  addTask: (
    title: string,
    description: string,
    reward: number,
    taskType:
      | 'watch_ad'
      | 'watch_video'
      | 'referral'
      | 'profile'
      | 'social',
  ) => Promise<void>;

  editTask: (
    id: string,
    title: string,
    description: string,
    reward: number,
  ) => Promise<void>;

  deleteTask: (
    id: string,
  ) => Promise<void>;

  resetAllTasks: () => void;

  // ====================================================
  // TRANSACTIONS
  // ====================================================

  transactions: Transaction[];

  refreshTransactions: () => Promise<void>;

  // ====================================================
  // AUTH
  // ====================================================

  isLoading: boolean;

  register: (
    data: any,
  ) => Promise<boolean>;

  login: (
    email: string,
    password: string,
  ) => Promise<boolean>;

  logout: () => Promise<void>;

  markLoggedIn: () => void;

  refreshProfile: () => Promise<void>;

  // ====================================================
  // SWAP
  // ====================================================

  swapCoins: (
    amount: number,
    type:
      | 'airtime'
      | 'data'
      | 'usdt',
  ) => boolean;
};

// ======================================================
// DEFAULT TASKS
// ======================================================

const defaultTasks: Task[] = [];

// ======================================================
// CONTEXT
// ======================================================

const UserContext =
  createContext<
    UserContextType | undefined
  >(undefined);

// ======================================================
// PROVIDER
// ======================================================

export const UserProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // ====================================================
  // AUTH STATE
  // ====================================================

  const [
    isLoggedIn,
    setIsLoggedIn,
  ] = useState(false);

  const [
    user,
    setUser,
  ] = useState<UserInfo | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  // ====================================================
  // WALLET STATE
  // ====================================================

  const [
    balance,
    setBalance,
  ] = useState(0);

  const [
    walletAddress,
    setWalletAddress,
  ] = useState<string | null>(
    null,
  );

  // ====================================================
  // MINING STATE
  // ====================================================

  const [
    lastClaimTime,
    setLastClaimTime,
  ] = useState<number | null>(
    null,
  );

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(0);

  const [
    miningReward,
    setMiningReward,
  ] = useState(
    BASE_MINING_REWARD,
  );

  const [
    miningRate,
    setMiningRate,
  ] = useState(
    BASE_MINING_REWARD / 24,
  );

  const [
    boostMultiplier,
    setBoostMultiplier,
  ] = useState(1);

  const [
    nextClaimAt,
    setNextClaimAt,
  ] = useState<string | null>(
    null,
  );

  // ====================================================
  // BOOST STATE
  // ====================================================

  const [
    boostEndTime,
    setBoostEndTime,
  ] = useState<number | null>(
    null,
  );

  const [
    boostTimeLeft,
    setBoostTimeLeft,
  ] = useState(0);

  // ====================================================
  // TASK STATE
  // ====================================================

  const [
    tasks,
    setTasks,
  ] = useState<Task[]>(
    defaultTasks,
  );

  // ====================================================
  // TRANSACTION STATE
  // ====================================================

  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>(
    [],
  );

  // ====================================================
  // CONVERT DATABASE PROFILE
  // ====================================================

  const convertProfile = (
    profile: any,
  ): UserInfo => {
    return {
      firstName:
        profile?.first_name || '',

      lastName:
        profile?.last_name || '',

      phone:
        profile?.phone || '',

      email:
        profile?.email || '',

      userId:
        String(
          profile?.id || '',
        ),

      referralCode:
        profile?.referral_code || '',

      referredBy:
        profile?.referred_by || null,

      referralCount: Number(
        profile?.referral_count || 0,
      ),

      avatarUrl:
        profile?.avatar_url || null,
    };
  };

  // ======notification======
const [
  notifications,
  setNotifications,
] = useState<any[]>([]);

const [
  unreadNotificationCount,
  setUnreadNotificationCount,
] = useState(0);

  // ====================================================
  // CONVERT DATABASE TRANSACTION
  // ====================================================


  const convertTransaction = (
    transaction: any,
  ): Transaction => {
    const rawAmount =
      Number(
        transaction?.amount ?? 0,
      );

    let type:
      Transaction['type'] =
        transaction?.type || 'other';

    // ==================================================
    // SUPPORT OLD DATABASE TRANSFERS
    // ==================================================

    if (type === 'transfer') {
      if (rawAmount < 0) {
        type = 'sent';
      } else if (rawAmount > 0) {
        type = 'received';
      }
    }

    // ==================================================
    // SUPPORT EXPLICIT SENT / RECEIVED TYPES
    // ==================================================

    if (type === 'sent') {
      type = 'sent';
    }

    if (type === 'received') {
      type = 'received';
    }

    return {
      id:
        String(
          transaction?.id || '',
        ),

      type,

      amount: rawAmount,

      description:
        transaction?.description ||
        'Wallet transaction',

      date:
        transaction?.created_at
          ? new Date(
              transaction.created_at,
            ).getTime()
          : Date.now(),
    };
  };

  // ====================================================
  // SORT TRANSACTIONS
  // ====================================================

  const sortTransactions = (
    items: Transaction[],
  ): Transaction[] => {
    return [...items].sort(
      (a, b) =>
        b.date - a.date,
    );
  };

  // ====================================================
  // UPDATE MINING VALUES
  // ====================================================

  const updateMiningValues = (
    boostActive: boolean,
  ) => {
    const reward =
      boostActive
        ? BOOSTED_MINING_REWARD
        : BASE_MINING_REWARD;

    const multiplier =
      boostActive
        ? 1 + BOOST_PERCENT
        : 1;

    setMiningReward(reward);

    setMiningRate(
      reward / 24,
    );

    setBoostMultiplier(
      multiplier,
    );
  };

  // ====================================================
  // RESET USER DATA
  // ====================================================

  const resetUserData = () => {
    setIsLoggedIn(false);

    setUser(null);

    setBalance(0);

    setWalletAddress(null);

    setLastClaimTime(null);

    setBoostEndTime(null);

    setTasks(defaultTasks);

    setTransactions([]);

    setTimeLeft(0);

    setBoostTimeLeft(0);
    setNotifications([]);

setUnreadNotificationCount(0);

    setMiningReward(
      BASE_MINING_REWARD,
    );

    setMiningRate(
      BASE_MINING_REWARD / 24,
    );

    setBoostMultiplier(1);

    setNextClaimAt(null);
  };

  // ====================================================
  // LOAD WALLET FROM DATABASE
  // ====================================================

  const refreshWallet =
    async (): Promise<void> => {
      try {
        const response =
          await apiRequest(
            '/wallet',
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Unable to load wallet',
          );
        }

        const wallet =
          response?.data;

        if (!wallet) {
          throw new Error(
            'No wallet returned from server',
          );
        }

        setBalance(
          Number(
            wallet.balance ?? 0,
          ),
        );

        const address =
          wallet.wallet_address ||
          wallet.walletAddress ||
          null;

        setWalletAddress(
          address
            ? String(address)
                .trim()
                .toUpperCase()
            : null,
        );

        if (
          wallet.last_mined_at
        ) {
          const claimTime =
            new Date(
              wallet.last_mined_at,
            ).getTime();

          setLastClaimTime(
            claimTime,
          );

          setNextClaimAt(
            new Date(
              claimTime +
                MINING_DURATION_MS,
            ).toISOString(),
          );
        } else {
          setLastClaimTime(null);

          setNextClaimAt(null);
        }
      } catch (error) {
        console.error(
          'REFRESH WALLET ERROR:',
          error,
        );

        throw error;
      }
    };

  // ====================================================
  // LOAD TRANSACTION HISTORY FROM DATABASE
  // ====================================================

  const refreshTransactions =
    async (): Promise<void> => {
      try {
        console.log(
          'LOADING TRANSACTION HISTORY FROM DATABASE...',
        );

        const response =
          await apiRequest(
            '/wallet/transactions',
          );

        console.log(
          'TRANSACTION HISTORY RESPONSE:',
          response,
        );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Failed to load transaction history.',
          );
        }

        const databaseTransactions =
          Array.isArray(
            response?.data,
          )
            ? response.data
            : [];

        const convertedTransactions =
          sortTransactions(
            databaseTransactions.map(
              convertTransaction,
            ),
          );

        setTransactions(
          convertedTransactions,
        );

        console.log(
          'TRANSACTION HISTORY LOADED:',
          convertedTransactions,
        );
      } catch (error) {
        console.error(
          'REFRESH TRANSACTIONS ERROR:',
          error,
        );

        setTransactions([]);

        throw error;
      }
    };

  // ====================================================
  // TRANSFER COINS
  // ====================================================

  const transferCoins =
    async (
      recipientWalletAddress: string,
      amount: number,
    ): Promise<void> => {
      try {
        const normalizedWalletAddress =
          String(
            recipientWalletAddress || '',
          )
            .trim()
            .toUpperCase();

        if (
          !normalizedWalletAddress
        ) {
          throw new Error(
            'Recipient wallet address is required.',
          );
        }

        const transferAmount =
          Number(amount);

        if (
          !Number.isFinite(
            transferAmount,
          ) ||
          transferAmount <= 0
        ) {
          throw new Error(
            'Please enter a valid amount greater than 0.',
          );
        }

        if (
          !Number.isInteger(
            transferAmount * 100,
          )
        ) {
          throw new Error(
            'Amount can have a maximum of 2 decimal places.',
          );
        }

        if (
          normalizedWalletAddress ===
          walletAddress
            ?.trim()
            .toUpperCase()
        ) {
          throw new Error(
            'You cannot transfer coins to your own wallet.',
          );
        }

        console.log(
          'SENDING TRANSFER REQUEST:',
          {
            walletAddress:
              normalizedWalletAddress,
            amount:
              transferAmount,
          },
        );

        const response =
          await apiRequest(
            '/wallet/transfer',
            {
              method: 'POST',

              body:
                JSON.stringify({
                  walletAddress:
                    normalizedWalletAddress,

                  amount:
                    transferAmount,
                }),
            },
          );

        console.log(
          'TRANSFER RESPONSE:',
          response,
        );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Coin transfer failed.',
          );
        }

        // ==================================================
        // UPDATE WALLET IMMEDIATELY IF RETURNED
        // ==================================================

        const updatedWallet =
          response?.data?.wallet;

        if (updatedWallet) {
          setBalance(
            Number(
              updatedWallet.balance ?? 0,
            ),
          );

          const address =
            updatedWallet.wallet_address ||
            updatedWallet.walletAddress;

          if (address) {
            setWalletAddress(
              String(address)
                .trim()
                .toUpperCase(),
            );
          }
        }

        // ==================================================
        // ADD RETURNED SENDER TRANSACTION IMMEDIATELY
        // ==================================================

        const senderTransaction =
          response?.data
            ?.senderTransaction;

        if (
          senderTransaction
        ) {
          const converted =
            convertTransaction(
              senderTransaction,
            );

          setTransactions(
            (currentTransactions) => {
              const exists =
                currentTransactions.some(
                  (transaction) =>
                    transaction.id ===
                    converted.id,
                );

              if (exists) {
                return currentTransactions;
              }

              return sortTransactions([
                converted,
                ...currentTransactions,
              ]);
            },
          );
        }

        // ==================================================
        // IMPORTANT:
        // RELOAD EVERYTHING FROM DATABASE
        // ==================================================

        await refreshWallet();

        await refreshTransactions();

        console.log(
          'TRANSFER DATABASE HISTORY REFRESHED SUCCESSFULLY',
        );
      } catch (error: any) {
        console.error(
          'TRANSFER COINS ERROR:',
          error,
        );

        throw new Error(
          error?.message ||
            'Failed to transfer coins.',
        );
      }
    };

  // ====================================================
  // LOAD MINING STATUS
  // ====================================================

  const fetchMiningStatus =
    async (): Promise<void> => {
      await refreshWallet();
    };

  // ====================================================
  // LOAD TASKS
  // ====================================================

  const refreshTasks =
    async (): Promise<void> => {
      try {
        const response =
          await apiRequest(
            '/tasks',
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Failed to load tasks.',
          );
        }

        const databaseTasks =
          response?.data || [];

        const convertedTasks: Task[] =
          databaseTasks.map(
            (task: any) => ({
              id:
                String(task.id),

              title:
                task.title || '',

              description:
                task.description || '',

              reward: Number(
                task.reward || 0,
              ),

              completed: Boolean(
                task.completed,
              ),

              started: Boolean(
                task.started,
              ),

              startedAt:
                task.started_at
                  ? new Date(
                      task.started_at,
                    ).getTime()
                  : null,
            }),
          );

        setTasks(
          convertedTasks,
        );
      } catch (error) {
        console.error(
          'REFRESH TASKS ERROR:',
          error,
        );

        setTasks([]);
      }
    };
    // ====================================================
// REGISTER PUSH NOTIFICATION DEVICE
// ====================================================

const registerPushNotificationDevice =
  async (): Promise<void> => {
    try {
      const expoPushToken =
        await getExpoPushToken();

      if (!expoPushToken) {
        console.log(
          'NO EXPO PUSH TOKEN AVAILABLE',
        );

        return;
      }

      console.log(
        'REGISTERING EXPO PUSH TOKEN WITH SERVER:',
        expoPushToken,
      );

      const response =
        await apiRequest(
          '/notifications/device',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                expoPushToken,

                platform:
                  Platform.OS,

                deviceName:
                  'CoinEarn Device',
              }),
          },
        );

      console.log(
        'PUSH DEVICE REGISTRATION RESPONSE:',
        response,
      );

      if (
        !response?.success
      ) {
        console.error(
          'PUSH DEVICE REGISTRATION FAILED:',
          response?.message,
        );

        return;
      }

      console.log(
        'PUSH DEVICE REGISTERED SUCCESSFULLY',
      );
    } catch (error) {
      console.error(
        'REGISTER PUSH NOTIFICATION DEVICE ERROR:',
        error,
      );
    }
  };

  // ====================================================
  // LOAD PROFILE
  // ====================================================

  const refreshProfile =
    async (): Promise<void> => {
      try {
        const response =
          await apiRequest(
            '/auth/me',
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Unable to load profile.',
          );
        }

        const profile =
          response?.data?.profile;

        if (!profile) {
          throw new Error(
            'No profile returned from server.',
          );
        }

        setUser(
          convertProfile(profile),
        );

        setIsLoggedIn(true);
        await registerPushNotificationDevice();
        await Promise.all([
          refreshWallet(),
          refreshTasks(),
          refreshTransactions(),
        ]);
      } catch (error) {
        console.error(
          'REFRESH PROFILE ERROR:',
          error,
        );

        throw error;
      }
    };

  // ====================================================
  // RESTORE SESSION
  // ====================================================

  const restoreSession =
    async (): Promise<void> => {
      try {
        setIsLoading(true);

        const accessToken =
          await AsyncStorage.getItem(
            ACCESS_TOKEN_KEY,
          );

        if (!accessToken) {
          resetUserData();

          return;
        }

        try {
          await refreshProfile();
        } catch (error) {
          console.error(
            'TOKEN INVALID OR SESSION EXPIRED:',
            error,
          );

          await AsyncStorage.multiRemove([
            ACCESS_TOKEN_KEY,
            REFRESH_TOKEN_KEY,
          ]);

          resetUserData();
        }
      } catch (error) {
        console.error(
          'SESSION RESTORATION ERROR:',
          error,
        );

        resetUserData();
      } finally {
        setIsLoading(false);
      }
    };

  // ====================================================
  // INITIALIZE
  // ====================================================

  useEffect(() => {
    restoreSession();
  }, []);

  // ====================================================
  // MARK LOGGED IN
  // ====================================================

  const markLoggedIn = () => {
    setIsLoggedIn(true);

    refreshProfile().catch(
      (error) => {
        console.error(
          'PROFILE LOAD AFTER LOGIN FAILED:',
          error,
        );
      },
    );
  };

  // ====================================================
  // REGISTER
  // ====================================================

  const register =
    async (
      data: any,
    ): Promise<boolean> => {
      try {
        const response =
          await apiRequest(
            '/auth/register',
            {
              method: 'POST',

              body:
                JSON.stringify({
                  firstName:
                    data.firstName,

                  lastName:
                    data.lastName,

                  phone:
                    data.phone,

                  email:
                    data.email
                      .trim()
                      .toLowerCase(),

                  password:
                    data.password,

                  referralCode:
                    data.referralCode
                      ?.trim()
                      .toUpperCase() ||
                    null,
                }),
            },
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Registration failed.',
          );
        }

        const session =
          response?.data?.session;

        if (
          !session?.access_token
        ) {
          return false;
        }

        await AsyncStorage.setItem(
          ACCESS_TOKEN_KEY,
          session.access_token,
        );

        if (
          session.refresh_token
        ) {
          await AsyncStorage.setItem(
            REFRESH_TOKEN_KEY,
            session.refresh_token,
          );
        }

        const profile =
          response?.data?.profile;

        if (profile) {
          setUser(
            convertProfile(profile),
          );

          setIsLoggedIn(true);
        }

        await Promise.all([
          refreshWallet(),
          refreshTasks(),
          refreshTransactions(),
        ]);

        return true;
      } catch (error) {
        console.error(
          'REGISTER ERROR:',
          error,
        );

        return false;
      }
    };

  // ====================================================
  // LOGIN
  // ====================================================

  const login =
    async (
      email: string,
      password: string,
    ): Promise<boolean> => {
      try {
        const response =
          await apiRequest(
            '/auth/login',
            {
              method: 'POST',

              body:
                JSON.stringify({
                  email:
                    email
                      .trim()
                      .toLowerCase(),

                  password,
                }),
            },
          );

        if (!response?.success) {
          return false;
        }

        const session =
          response?.data?.session;

        if (
          !session?.access_token
        ) {
          return false;
        }

        await AsyncStorage.setItem(
          ACCESS_TOKEN_KEY,
          session.access_token,
        );

        if (
          session.refresh_token
        ) {
          await AsyncStorage.setItem(
            REFRESH_TOKEN_KEY,
            session.refresh_token,
          );
        }

        const profile =
          response?.data?.profile;

        if (profile) {
          setUser(
            convertProfile(profile),
          );

          setIsLoggedIn(true);
        } else {
          await refreshProfile();
        }

        await Promise.all([
  refreshWallet(),
  refreshTasks(),
  refreshTransactions(),
  refreshNotifications(),
]);

        return true;
      } catch (error) {
        console.error(
          'LOGIN ERROR:',
          error,
        );

        return false;
      }
    };

  // ====================================================
  // LOGOUT
  // ====================================================

  const logout =
    async (): Promise<void> => {
      try {
        try {
          await apiRequest(
            '/auth/logout',
            {
              method: 'POST',
            },
          );
        } catch (error) {
          console.log(
            'SERVER LOGOUT FAILED:',
            error,
          );
        }

        await AsyncStorage.multiRemove([
          ACCESS_TOKEN_KEY,
          REFRESH_TOKEN_KEY,
        ]);

        resetUserData();
      } catch (error) {
        console.error(
          'LOGOUT ERROR:',
          error,
        );
      }
    };

  // ====================================================
  // MINING + BOOST TIMERS
  // ====================================================

  useEffect(() => {
    const updateTimers = () => {
      const now =
        Date.now();

      if (lastClaimTime) {
        const nextClaim =
          lastClaimTime +
          MINING_DURATION_MS;

        const remainingMs =
          Math.max(
            0,
            nextClaim - now,
          );

        const remainingSeconds =
          Math.ceil(
            remainingMs / 1000,
          );

        setTimeLeft(
          remainingSeconds,
        );

        setNextClaimAt(
          new Date(
            nextClaim,
          ).toISOString(),
        );
      } else {
        setTimeLeft(0);

        setNextClaimAt(null);
      }

      if (boostEndTime) {
        const boostRemaining =
          Math.max(
            0,
            Math.ceil(
              (
                boostEndTime -
                now
              ) / 1000,
            ),
          );

        setBoostTimeLeft(
          boostRemaining,
        );

        if (
          boostRemaining === 0
        ) {
          setBoostEndTime(null);

          updateMiningValues(
            false,
          );
        } else {
          updateMiningValues(
            true,
          );
        }
      } else {
        setBoostTimeLeft(0);

        updateMiningValues(
          false,
        );
      }
    };

    updateTimers();

    const interval =
      setInterval(
        updateTimers,
        1000,
      );

    return () => {
      clearInterval(
        interval,
      );
    };
  }, [
    lastClaimTime,
    boostEndTime,
  ]);

  // ====================================================
  // MINING STATUS
  // ====================================================

  const canClaim =
    !lastClaimTime ||
    timeLeft <= 0;

  const isBoostActive =
    boostTimeLeft > 0;

  // ====================================================
  // CLAIM MINING REWARD
  // ====================================================

  const claimReward =
    async (): Promise<void> => {
      try {
        if (!canClaim) {
          return;
        }

        const response =
          await apiRequest(
            '/wallet/mine',
            {
              method: 'POST',
            },
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Mining failed.',
          );
        }

        await refreshWallet();

        await refreshTransactions();

        try {
          await scheduleMiningReminder();
        } catch (
          notificationError
        ) {
          console.error(
            'NOTIFICATION ERROR:',
            notificationError,
          );
        }
      } catch (error: any) {
        console.error(
          'CLAIM REWARD ERROR:',
          error,
        );

        throw error;
      }
    };

  // ====================================================
  // BOOST
  // ====================================================

  const activateBoost = () => {
    if (isBoostActive) {
      console.log(
        'BOOST ALREADY ACTIVE',
      );

      return;
    }

    const end =
      Date.now() +
      60 * 60 * 1000;

    setBoostEndTime(end);

    setBoostTimeLeft(
      60 * 60,
    );

    updateMiningValues(true);

    console.log(
      'BOOST ACTIVATED',
    );
  };

  // ====================================================
  // START TASK
  // ====================================================

  const startTask =
    async (
      taskId: string,
    ): Promise<void> => {
      try {
        if (!taskId) {
          throw new Error(
            'Task ID is required.',
          );
        }

        const response =
          await apiRequest(
            `/tasks/${taskId}/start`,
            {
              method: 'POST',
            },
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Failed to start task.',
          );
        }

        const startedAt =
          response?.data?.startedAt
            ? new Date(
                response.data
                  .startedAt,
              ).getTime()
            : Date.now();

        setTasks(
          (currentTasks) =>
            currentTasks.map(
              (task) =>
                task.id === taskId
                  ? {
                      ...task,
                      started: true,
                      startedAt,
                    }
                  : task,
            ),
        );
      } catch (error) {
        console.error(
          'START TASK ERROR:',
          error,
        );

        throw error;
      }
    };

  // ====================================================
  // COMPLETE TASK
  // ====================================================

  const completeTask =
    async (
      taskId: string,
    ): Promise<void> => {
      try {
        if (!taskId) {
          throw new Error(
            'Task ID is required.',
          );
        }

        const task =
          tasks.find(
            (item) =>
              item.id === taskId,
          );

        if (!task) {
          throw new Error(
            'Task not found.',
          );
        }

        if (task.completed) {
          throw new Error(
            'Task already completed.',
          );
        }

        const response =
          await apiRequest(
            `/tasks/${taskId}/complete`,
            {
              method: 'POST',
            },
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Failed to complete task.',
          );
        }

        setTasks(
          (currentTasks) =>
            currentTasks.map(
              (item) =>
                item.id === taskId
                  ? {
                      ...item,
                      completed: true,
                    }
                  : item,
            ),
        );

        await Promise.all([
          refreshWallet(),
          refreshTransactions(),
        ]);
      } catch (error) {
        console.error(
          'COMPLETE TASK ERROR:',
          error,
        );

        throw error;
      }
    };

  // ====================================================
  // ADD TASK
  // ====================================================

  const addTask =
    async (
      title: string,
      description: string,
      reward: number,
      taskType:
        | 'watch_ad'
        | 'watch_video'
        | 'referral'
        | 'profile'
        | 'social',
    ): Promise<void> => {
      try {
        const response =
          await apiRequest(
            '/tasks',
            {
              method: 'POST',

              body:
                JSON.stringify({
                  title,
                  description,
                  reward,
                  taskType,
                }),
            },
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Failed to create task.',
          );
        }

        await refreshTasks();
      } catch (error) {
        console.error(
          'ADD TASK ERROR:',
          error,
        );

        throw error;
      }
    };

  // ====================================================
  // EDIT TASK
  // ====================================================

  const editTask =
    async (
      id: string,
      title: string,
      description: string,
      reward: number,
    ): Promise<void> => {
      try {
        const response =
          await apiRequest(
            `/tasks/${id}`,
            {
              method: 'PUT',

              body:
                JSON.stringify({
                  title,
                  description,
                  reward,
                }),
            },
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Failed to update task.',
          );
        }

        await refreshTasks();
      } catch (error) {
        console.error(
          'EDIT TASK ERROR:',
          error,
        );

        throw error;
      }
    };

  // ====================================================
  // DELETE TASK
  // ====================================================

  const deleteTask =
    async (
      id: string,
    ): Promise<void> => {
      try {
        const response =
          await apiRequest(
            `/tasks/${id}`,
            {
              method: 'DELETE',
            },
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Failed to delete task.',
          );
        }

        await refreshTasks();
      } catch (error) {
        console.error(
          'DELETE TASK ERROR:',
          error,
        );

        throw error;
      }
    };

  // ====================================================
  // RESET TASKS
  // ====================================================

  const resetAllTasks = () => {
    setTasks(
      defaultTasks,
    );
  };

  // ====================================================
  // SWAP
  // ====================================================

  const swapCoins = (
    amount: number,
    type:
      | 'airtime'
      | 'data'
      | 'usdt',
  ): boolean => {
    if (
      amount <= 0 ||
      amount > balance
    ) {
      return false;
    }

    setBalance(
      (currentBalance) =>
        currentBalance -
        amount,
    );

    return true;
  };

  // ====================================================
  // PROVIDER
  // ====================================================

  return (
    <UserContext.Provider
      value={{
        // AUTH
        isLoggedIn,
        user,
        isLoading,
        register,
        login,
        logout,
        markLoggedIn,
        refreshProfile,
        registerPushNotificationDevice,

        // WALLET
        balance,
        walletAddress,
        refreshWallet,
        transferCoins,

        // MINING
        lastClaimTime,
        boostEndTime,
        canClaim,
        timeLeft,
        claimReward,
        miningReward,
        miningRate,
        boostMultiplier,
        nextClaimAt,
        fetchMiningStatus,

        // BOOST
        isBoostActive,
        boostTimeLeft,
        activateBoost,

        // TASKS
        tasks,
        completeTask,
        startTask,
        addTask,
        editTask,
        deleteTask,
        resetAllTasks,

        // TRANSACTIONS
        transactions,
        refreshTransactions,

        // SWAP
        swapCoins,
      }}
    >
      {children}
    </UserContext.Provider>
  );
  // ====================================================
// REFRESH NOTIFICATIONS
// ====================================================

const refreshNotifications =
  async (): Promise<void> => {
    try {
      const response =
        await apiRequest(
          '/notifications',
        );

      if (
        !response?.success
      ) {
        throw new Error(
          response?.message ||
            'Failed to load notifications.',
        );
      }

      const data =
        Array.isArray(
          response?.data,
        )
          ? response.data
          : [];

      setNotifications(
        data,
      );

      setUnreadNotificationCount(
        Number(
          response?.unreadCount ||
            0,
        ),
      );
    } catch (error) {
      console.error(
        'REFRESH NOTIFICATIONS ERROR:',
        error,
      );
    }
  };


// ====================================================
// MARK NOTIFICATION AS READ
// ====================================================

const markNotificationAsRead =
  async (
    notificationId: string,
  ): Promise<void> => {
    try {
      if (!notificationId) {
        return;
      }

      const response =
        await apiRequest(
          `/notifications/${notificationId}/read`,
          {
            method:
              'PATCH',
          },
        );

      if (
        !response?.success
      ) {
        throw new Error(
          response?.message ||
            'Failed to mark notification as read.',
        );
      }

      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,

                    is_read:
                      true,
                  }
                : notification,
          ),
      );

      setUnreadNotificationCount(
        (current) =>
          Math.max(
            0,
            current - 1,
          ),
      );
    } catch (error) {
      console.error(
        'MARK NOTIFICATION READ ERROR:',
        error,
      );
    }
  };


// ====================================================
// MARK ALL NOTIFICATIONS AS READ
// ====================================================

const markAllNotificationsAsRead =
  async (): Promise<void> => {
    try {
      const response =
        await apiRequest(
          '/notifications/read-all',
          {
            method:
              'PATCH',
          },
        );

      if (
        !response?.success
      ) {
        throw new Error(
          response?.message ||
            'Failed to mark notifications as read.',
        );
      }

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,

              is_read:
                true,
            }),
          ),
      );

      setUnreadNotificationCount(
        0,
      );
    } catch (error) {
      console.error(
        'MARK ALL NOTIFICATIONS READ ERROR:',
        error,
      );
    }
  };
  // ====================================================
// NOTIFICATION POLLING
// ====================================================

useEffect(() => {
  if (!isLoggedIn) {
    return;
  }

  refreshNotifications();

  const interval =
    setInterval(() => {
      refreshNotifications();
    }, 15000);

  return () => {
    clearInterval(
      interval,
    );
  };
}, [
  isLoggedIn,
]);
};


// ======================================================
// HOOK
// ======================================================

export const useUser = () => {
  const context =
    useContext(UserContext);

  if (!context) {
    throw new Error(
      'useUser must be used inside UserProvider',
    );
  }

  return context;
};
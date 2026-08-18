import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { scheduleMiningReminder } from "../utils/notifications";

import {
  apiRequest,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "../services/api";

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
  type: "mine" | "task" | "swap" | "referral" | "bonus" | "other";
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

type UserContextType = {
  isLoggedIn: boolean;

  user: UserInfo | null;

  balance: number;

  lastClaimTime: number | null;

  boostEndTime: number | null;

  tasks: Task[];

  transactions: Transaction[];

  isLoading: boolean;

  register: (data: any) => Promise<boolean>;

  login: (email: string, password: string) => Promise<boolean>;

  logout: () => Promise<void>;

  markLoggedIn: () => void;

  refreshProfile: () => Promise<void>;

  canClaim: boolean;

  timeLeft: number;

  claimReward: () => Promise<void>;

  isBoostActive: boolean;

  boostTimeLeft: number;

  activateBoost: () => void;

  completeTask: (taskId: string) => Promise<void>;

  startTask: (taskId: string) => Promise<void>;

  addTask: (
    title: string,
    description: string,
    reward: number,
    taskType: "watch_ad" | "watch_video" | "referral" | "profile" | "social",
  ) => Promise<void>;

  editTask: (
    id: string,
    title: string,
    description: string,
    reward: number,
  ) => Promise<void>;

  deleteTask: (id: string) => Promise<void>;

  resetAllTasks: () => void;

  swapCoins: (amount: number, type: "airtime" | "data" | "usdt") => boolean;
};

// ======================================================
// DEFAULT TASKS
// ======================================================

const defaultTasks: Task[] = [];
// ======================================================
// CONTEXT
// ======================================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ======================================================
// PROVIDER
// ======================================================

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // ====================================================
  // STATE
  // ====================================================

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [user, setUser] = useState<UserInfo | null>(null);

  const [balance, setBalance] = useState(0);

  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);

  const [boostEndTime, setBoostEndTime] = useState<number | null>(null);

  const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState(0);

  const [boostTimeLeft, setBoostTimeLeft] = useState(0);

  // ====================================================
  // CONVERT DATABASE PROFILE
  // ====================================================

  const convertProfile = (profile: any): UserInfo => {
    return {
      firstName: profile?.first_name || "",

      lastName: profile?.last_name || "",

      phone: profile?.phone || "",

      email: profile?.email || "",

      userId: profile?.id || "",

      referralCode: profile?.referral_code || "",

      referredBy: profile?.referred_by || null,

      referralCount: Number(profile?.referral_count || 0),

      avatarUrl: profile?.avatar_url || null,
    };
  };

  // ====================================================
  // LOAD WALLET
  // ====================================================

  const refreshWallet = async () => {
    try {
      console.log("====================================");

      console.log("REFRESHING WALLET...");

      const response = await apiRequest("/wallet");

      console.log("WALLET RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load wallet");
      }

      const wallet = response?.data;

      if (!wallet) {
        throw new Error("No wallet returned from server");
      }

      // --------------------------------------------
      // UPDATE BALANCE
      // --------------------------------------------

      setBalance(Number(wallet.balance || 0));

      // --------------------------------------------
      // UPDATE LAST MINING TIME
      // --------------------------------------------

      if (wallet.last_mined_at) {
        setLastClaimTime(new Date(wallet.last_mined_at).getTime());
      } else {
        setLastClaimTime(null);
      }

      console.log("DATABASE BALANCE:", wallet.balance);

      console.log("LAST MINED:", wallet.last_mined_at);

      console.log("====================================");
    } catch (error) {
      console.error("REFRESH WALLET ERROR:", error);
    }
  };

  // ====================================================
  // LOAD TASKS FROM DATABASE
  // ====================================================

  const refreshTasks = async () => {
    try {
      console.log("====================================");
      console.log("LOADING TASKS FROM DATABASE...");

      const response = await apiRequest("/tasks");

      console.log("TASKS RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load tasks");
      }

      const databaseTasks = response?.data || [];

      const convertedTasks: Task[] = databaseTasks.map((task: any) => ({
        // IMPORTANT:
        // Always use the UUID coming from Supabase
        id: String(task.id),

        title: task.title || "",

        description: task.description || "",

        reward: Number(task.reward || 0),

        completed: Boolean(task.completed),

        started: Boolean(task.started),

        startedAt: task.started_at ? new Date(task.started_at).getTime() : null,
      }));

      console.log("DATABASE TASK COUNT:", convertedTasks.length);

      console.log(
        "DATABASE TASK IDS:",
        convertedTasks.map((task) => task.id),
      );

      setTasks(convertedTasks);

      console.log("TASKS LOADED SUCCESSFULLY");
      console.log("====================================");
    } catch (error) {
      console.error("REFRESH TASKS ERROR:", error);

      // Do NOT put fake/default tasks here.
      setTasks([]);
    }
  };
  // ====================================================
  // LOAD PROFILE
  // ====================================================

  const refreshProfile = async () => {
    try {
      console.log("====================================");

      console.log("REFRESHING PROFILE...");

      const response = await apiRequest("/auth/me");

      console.log("AUTH ME RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load profile");
      }

      const profile = response?.data?.profile;

      if (!profile) {
        throw new Error("No profile returned from server");
      }

      const databaseUser = convertProfile(profile);

      setUser(databaseUser);

      setIsLoggedIn(true);

      console.log("PROFILE LOADED:", databaseUser);

      // Load wallet after profile
      await refreshWallet();

      // Load tasks
      await refreshTasks();

      console.log("====================================");
    } catch (error) {
      console.error("REFRESH PROFILE ERROR:", error);

      throw error;
    }
  };

  // ====================================================
  // RESTORE SESSION
  // ====================================================

  const restoreSession = async () => {
    try {
      setIsLoading(true);

      console.log("====================================");

      console.log("RESTORING SESSION...");

      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

      if (!accessToken) {
        console.log("NO ACCESS TOKEN");

        setIsLoggedIn(false);
        setUser(null);

        return;
      }

      console.log("ACCESS TOKEN FOUND");

      // ----------------------------------------------
      // VERIFY TOKEN
      // ----------------------------------------------

      try {
        await refreshProfile();

        console.log("SESSION RESTORED SUCCESSFULLY");
      } catch (error) {
        console.error("TOKEN INVALID OR SESSION EXPIRED:", error);

        await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);

        setIsLoggedIn(false);
        setUser(null);
        setBalance(0);
        setTasks(defaultTasks);
        setTransactions([]);
      }
    } catch (error) {
      console.error("SESSION RESTORATION ERROR:", error);

      setIsLoggedIn(false);
      setUser(null);
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

    refreshProfile().catch((error) => {
      console.error("PROFILE LOAD AFTER LOGIN FAILED:", error);
    });
  };

  // ====================================================
  // REGISTER
  // ====================================================

  const register = async (data: any): Promise<boolean> => {
    try {
      console.log("REGISTERING USER...");

      const response = await apiRequest("/auth/register", {
        method: "POST",

        body: JSON.stringify({
          firstName: data.firstName,

          lastName: data.lastName,

          phone: data.phone,

          email: data.email.trim().toLowerCase(),

          password: data.password,

          referralCode: data.referralCode?.trim().toUpperCase() || null,
        }),
      });

      console.log("REGISTER RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Registration failed");
      }

      const session = response?.data?.session;

      if (!session?.access_token) {
        console.error("NO ACCESS TOKEN AFTER REGISTRATION");

        return false;
      }

      // ----------------------------------------------
      // SAVE ACCESS TOKEN
      // ----------------------------------------------

      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);

      // ----------------------------------------------
      // SAVE REFRESH TOKEN
      // ----------------------------------------------

      if (session.refresh_token) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
      }

      // ----------------------------------------------
      // LOAD EVERYTHING
      // ----------------------------------------------

      const profile = response?.data?.profile;

      if (profile) {
        setUser(convertProfile(profile));

        setIsLoggedIn(true);
      }

      await refreshWallet();

      await refreshTasks();

      return true;
    } catch (error: any) {
      console.error("REGISTER ERROR:", error);

      return false;
    }
  };

  // ====================================================
  // LOGIN
  // ====================================================

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("====================================");

      console.log("LOGIN STARTED");

      const response = await apiRequest("/auth/login", {
        method: "POST",

        body: JSON.stringify({
          email: email.trim().toLowerCase(),

          password,
        }),
      });

      console.log("LOGIN RESPONSE:", response);

      if (!response?.success) {
        console.error("LOGIN FAILED:", response?.message);

        return false;
      }

      const session = response?.data?.session;

      if (!session?.access_token) {
        console.error("NO ACCESS TOKEN RECEIVED");

        return false;
      }

      // ----------------------------------------------
      // SAVE ACCESS TOKEN
      // ----------------------------------------------

      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);

      // ----------------------------------------------
      // SAVE REFRESH TOKEN
      // ----------------------------------------------

      if (session.refresh_token) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
      }

      console.log("AUTH TOKENS SAVED");

      // ----------------------------------------------
      // LOAD PROFILE
      // ----------------------------------------------

      const profile = response?.data?.profile;

      if (profile) {
        const databaseUser = convertProfile(profile);

        setUser(databaseUser);

        setIsLoggedIn(true);

        console.log("USER PROFILE LOADED:", databaseUser);
      } else {
        await refreshProfile();
      }

      // ----------------------------------------------
      // LOAD WALLET
      // ----------------------------------------------

      await refreshWallet();

      // ----------------------------------------------
      // LOAD TASKS
      // ----------------------------------------------

      await refreshTasks();

      console.log("LOGIN COMPLETED");

      return true;
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      return false;
    }
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = async () => {
    try {
      console.log("LOGGING OUT...");

      // ----------------------------------------------
      // OPTIONAL SERVER LOGOUT
      // ----------------------------------------------

      try {
        await apiRequest("/auth/logout", {
          method: "POST",
        });
      } catch (error) {
        console.log("SERVER LOGOUT FAILED:", error);
      }

      // ----------------------------------------------
      // REMOVE TOKENS
      // ----------------------------------------------

      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);

      // ----------------------------------------------
      // CLEAR STATE
      // ----------------------------------------------

      setIsLoggedIn(false);

      setUser(null);

      setBalance(0);

      setLastClaimTime(null);

      setBoostEndTime(null);

      setTasks(defaultTasks);

      setTransactions([]);

      console.log("LOGOUT SUCCESSFUL");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  // ====================================================
  // TIMERS
  // ====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // --------------------------------------------
      // MINING TIMER
      // --------------------------------------------

      if (lastClaimTime) {
        const nextClaim = lastClaimTime + 24 * 60 * 60 * 1000;

        const remaining = Math.max(0, Math.floor((nextClaim - now) / 1000));

        setTimeLeft(remaining);
      } else {
        setTimeLeft(0);
      }

      // --------------------------------------------
      // BOOST TIMER
      // --------------------------------------------

      if (boostEndTime) {
        const remaining = Math.max(0, Math.floor((boostEndTime - now) / 1000));

        setBoostTimeLeft(remaining);

        if (remaining === 0) {
          setBoostEndTime(null);
        }
      } else {
        setBoostTimeLeft(0);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [lastClaimTime, boostEndTime]);

  // ====================================================
  // MINING
  // ====================================================

  const canClaim = !lastClaimTime || timeLeft === 0;

  const isBoostActive = boostTimeLeft > 0;

  // ====================================================
  // CLAIM MINING REWARD
  // ====================================================

  const claimReward = async () => {
    try {
      if (!canClaim) {
        return;
      }

      console.log("====================================");

      console.log("MINING COINS...");

      // --------------------------------------------
      // CALL BACKEND
      // --------------------------------------------

      const response = await apiRequest("/wallet/mine", {
        method: "POST",
      });

      console.log("MINING RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Mining failed");
      }

      // --------------------------------------------
      // DATABASE WALLET
      // --------------------------------------------

      const wallet = response?.data?.wallet;

      if (wallet) {
        setBalance(Number(wallet.balance || 0));

        if (wallet.last_mined_at) {
          setLastClaimTime(new Date(wallet.last_mined_at).getTime());
        }
      }

      // --------------------------------------------
      // TRANSACTION
      // --------------------------------------------

      const transaction = response?.data?.transaction;

      if (transaction) {
        setTransactions((current) => [
          {
            id: transaction.id,

            type: "mine",

            amount: Number(transaction.amount || 0),

            description: transaction.description || "Daily mining reward",

            date: transaction.created_at
              ? new Date(transaction.created_at).getTime()
              : Date.now(),
          },

          ...current,
        ]);
      }

      // --------------------------------------------
      // SCHEDULE REMINDER
      // --------------------------------------------

      try {
        await scheduleMiningReminder();
      } catch (notificationError) {
        console.error("NOTIFICATION ERROR:", notificationError);
      }

      console.log("MINING SUCCESSFUL");

      console.log("DATABASE BALANCE:", wallet?.balance);

      console.log("====================================");
    } catch (error: any) {
      console.error("CLAIM REWARD ERROR:", error);

      throw error;
    }
  };

  // ====================================================
  // BOOST
  // ====================================================

  const activateBoost = () => {
    if (isBoostActive) {
      console.log("BOOST ALREADY ACTIVE");

      return;
    }

    const end = Date.now() + 60 * 60 * 1000;

    setBoostEndTime(end);

    console.log("BOOST ACTIVATED");

    console.log("BOOST ENDS:", new Date(end));
  };

  // ====================================================
  // START TASK
  // ====================================================
  const startTask = async (taskId: string) => {
    try {
      console.log("====================================");
      console.log("STARTING TASK");
      console.log("TASK ID:", taskId);
      console.log("====================================");

      if (!taskId) {
        throw new Error("Task ID is required");
      }

      // Make sure we are not sending a fake numeric ID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(taskId)) {
        console.error("INVALID TASK UUID:", taskId);

        throw new Error(
          "Invalid task ID. Please reload tasks from the database.",
        );
      }

      const response = await apiRequest(`/tasks/${taskId}/start`, {
        method: "POST",
      });

      console.log("START TASK RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to start task");
      }

      const startedAt = response?.data?.startedAt
        ? new Date(response.data.startedAt).getTime()
        : Date.now();

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                started: true,
                startedAt,
              }
            : task,
        ),
      );

      console.log("TASK STARTED SUCCESSFULLY");
    } catch (error) {
      console.error("START TASK ERROR:", error);

      throw error;
    }
  };
  // ====================================================
  // COMPLETE TASK
  // ====================================================

  const completeTask = async (taskId: string) => {
    try {
      console.log("====================================");
      console.log("COMPLETING TASK");
      console.log("TASK ID:", taskId);
      console.log("====================================");

      if (!taskId) {
        throw new Error("Task ID is required");
      }

      // Validate UUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(taskId)) {
        console.error("INVALID TASK UUID:", taskId);

        throw new Error(
          "Invalid task ID. Please reload the tasks from the database.",
        );
      }

      // Find task locally
      const task = tasks.find((item) => item.id === taskId);

      if (!task) {
        throw new Error("Task not found in the current task list.");
      }

      if (task.completed) {
        throw new Error("Task already completed.");
      }

      // ============================================
      // CALL BACKEND
      // ============================================

      const response = await apiRequest(`/tasks/${taskId}/complete`, {
        method: "POST",
      });

      console.log("COMPLETE TASK RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to complete task");
      }

      // ============================================
      // DATABASE WALLET
      // ============================================

      const updatedWallet = response?.data?.wallet;

      if (updatedWallet) {
        setBalance(Number(updatedWallet.balance || 0));
      }

      // ============================================
      // REWARD
      // ============================================

      const reward = Number(response?.data?.reward || task.reward || 5);

      // ============================================
      // MARK TASK COMPLETED
      // ============================================

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === taskId
            ? {
                ...item,
                completed: true,
              }
            : item,
        ),
      );

      // ============================================
      // TRANSACTION
      // ============================================

      const transaction = response?.data?.transaction;

      if (transaction) {
        setTransactions((current) => [
          {
            id: transaction.id,

            type: "task",

            amount: Number(transaction.amount || reward),

            description: transaction.description || `Completed: ${task.title}`,

            date: transaction.created_at
              ? new Date(transaction.created_at).getTime()
              : Date.now(),
          },

          ...current,
        ]);
      }

      console.log("====================================");
      console.log("TASK COMPLETED SUCCESSFULLY");
      console.log("TASK:", task.title);
      console.log("REWARD:", reward);
      console.log("DATABASE BALANCE:", updatedWallet?.balance);
      console.log("====================================");
    } catch (error) {
      console.error("COMPLETE TASK ERROR:", error);

      throw error;
    }
  };
  // ====================================================
  // ADD TASK
  // ====================================================
  const addTask = async (
    title: string,
    description: string,
    reward: number,
    taskType: "watch_ad" | "watch_video" | "referral" | "profile" | "social",
  ) => {
    try {
      console.log("====================================");
      console.log("ADDING TASK TO DATABASE...");
      console.log("TITLE:", title);
      console.log("DESCRIPTION:", description);
      console.log("REWARD:", reward);
      console.log("TASK TYPE:", taskType);
      console.log("====================================");

      const response = await apiRequest("/tasks", {
        method: "POST",

        body: JSON.stringify({
          title,
          description,
          reward,
          taskType,
        }),
      });

      console.log("CREATE TASK RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to create task");
      }

      // Reload tasks from Supabase
      await refreshTasks();

      console.log("TASK CREATED SUCCESSFULLY IN DATABASE");

      console.log("====================================");
    } catch (error) {
      console.error("ADD TASK ERROR:", error);

      throw error;
    }
  };

  // ====================================================
  // EDIT TASK
  // ====================================================
  const editTask = async (
    id: string,
    title: string,
    description: string,
    reward: number,
  ) => {
    try {
      console.log("UPDATING TASK:", id);

      const response = await apiRequest(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          description,
          reward,
        }),
      });

      console.log("UPDATE TASK RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update task");
      }

      await refreshTasks();

      console.log("TASK UPDATED SUCCESSFULLY");
    } catch (error) {
      console.error("EDIT TASK ERROR:", error);

      throw error;
    }
  };

  // ====================================================
  // DELETE TASK
  // ====================================================

  const deleteTask = async (id: string) => {
    try {
      console.log("DELETING TASK:", id);

      const response = await apiRequest(`/tasks/${id}`, {
        method: "DELETE",
      });

      console.log("DELETE TASK RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to delete task");
      }

      await refreshTasks();

      console.log("TASK DELETED SUCCESSFULLY");
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);

      throw error;
    }
  };

  // ====================================================
  // RESET TASKS
  // ====================================================

  const resetAllTasks = () => {
    setTasks(defaultTasks);
  };

  // ====================================================
  // SWAP
  // ====================================================

  const swapCoins = (
    amount: number,
    type: "airtime" | "data" | "usdt",
  ): boolean => {
    if (amount <= 0 || amount > balance) {
      return false;
    }

    setBalance((currentBalance) => currentBalance - amount);

    const transaction: Transaction = {
      id: Date.now().toString(),

      type: "swap",

      amount: -amount,

      description: `Swapped coins for ${type}`,

      date: Date.now(),
    };

    setTransactions((current) => [transaction, ...current]);

    return true;
  };

  // ====================================================
  // PROVIDER
  // ====================================================

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,

        user,

        balance,

        lastClaimTime,

        boostEndTime,

        tasks,

        transactions,

        isLoading,

        register,

        login,

        logout,

        markLoggedIn,

        refreshProfile,

        canClaim,

        timeLeft,

        claimReward,

        isBoostActive,

        boostTimeLeft,

        activateBoost,

        completeTask,

        startTask,

        addTask,

        editTask,

        deleteTask,

        resetAllTasks,

        swapCoins,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ======================================================
// HOOK
// ======================================================

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
};

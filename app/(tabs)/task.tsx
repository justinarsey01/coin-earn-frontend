import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Linking,
} from "react-native";

import { useUser } from "../../context/UserContext";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function TaskScreen() {
  const { tasks, completeTask, startTask, balance } = useUser();

  const [now, setNow] = useState(Date.now());

  // =====================================================
  // UPDATE TIMER EVERY SECOND
  // =====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // EXTRACT URL FROM DESCRIPTION
  // =====================================================

  const extractUrl = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);

    return match ? match[0] : null;
  };

  // =====================================================
  // OPEN LINK
  // =====================================================

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this link");
      }
    } catch (error) {
      console.error("OPEN LINK ERROR:", error);

      Alert.alert("Error", "Failed to open the link");
    }
  };

  // =====================================================
  // START TASK
  // =====================================================

const handleStartTask = async (item: any) => {
  try {
    const url = extractUrl(item.description);

    await startTask(item.id);

    if (url) {
      await openLink(url);
    } else {
      Alert.alert(
        'Task Started',
        'Please wait 8 seconds before completing.'
      );
    }
  } catch (error: any) {
    console.error(
      'START TASK ERROR:',
      error
    );

    Alert.alert(
      'Error',
      error?.message ||
        'Failed to start task'
    );
  }
};

  // =====================================================
  // COMPLETE TASK
  // =====================================================

  const handleComplete = (id: string, title: string, reward: number) => {
    Alert.alert(
      "Complete Task?",
      `Mark "${title}" as done and earn ${reward} coins?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Complete",

          onPress: async () => {
            try {
              console.log("COMPLETING TASK FROM SCREEN:", id);

              await completeTask(id);

              Alert.alert(
                "Success",
                `Task completed! +${reward} coins added to your balance.`,
              );
            } catch (error: any) {
              console.error("HANDLE COMPLETE TASK ERROR:", error);

              Alert.alert("Error", error?.message || "Failed to complete task");
            }
          },
        },
      ],
    );
  };

  // =====================================================
  // RENDER TASK
  // =====================================================

  const renderTask = ({ item }: any) => {
    const secondsPassed = item.startedAt
      ? Math.floor((now - item.startedAt) / 1000)
      : 0;

    const canComplete = item.started && secondsPassed >= 8;

    return (
      <View style={[styles.card, item.completed && styles.cardDone]}>
        {/* =================================================
            LEFT SIDE
        ================================================== */}

        <View style={styles.cardLeft}>
          <Text style={[styles.taskTitle, item.completed && styles.textDone]}>
            {item.title}
          </Text>

          <Text style={styles.taskDesc}>{item.description}</Text>

          <Text style={styles.reward}>+{item.reward} coins</Text>

          {/* =================================================
              COUNTDOWN
          ================================================== */}

          {item.started && !item.completed && !canComplete && (
            <Text style={styles.timerText}>
              Complete available in {Math.max(0, 8 - secondsPassed)}s
            </Text>
          )}
        </View>

        {/* =================================================
            RIGHT SIDE BUTTONS
        ================================================== */}

        <View style={styles.buttonColumn}>
          {/* START BUTTON */}

          {!item.completed && !item.started && (
            <TouchableOpacity
  style={styles.startBtn}
  onPress={() => handleStartTask(item)}
>
  <Ionicons
    name="play"
    size={16}
    color={Colors.white}
  />

  <Text style={styles.startBtnText}>
    Start Task
  </Text>
</TouchableOpacity>
          )}

          {/* COMPLETE BUTTON */}

          {!item.completed && item.started && (
            <TouchableOpacity
              style={[
                styles.completeBtn,
                !canComplete && styles.completeBtnDisabled,
              ]}
              onPress={() => {
                if (canComplete) {
                  handleComplete(item.id, item.title, Number(item.reward || 5));
                }
              }}
              disabled={!canComplete}
            >
              <Text style={styles.completeBtnText}>
                {canComplete ? "Complete" : "Wait..."}
              </Text>
            </TouchableOpacity>
          )}

          {/* DONE */}

          {item.completed && (
            <View style={styles.doneBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />

              <Text style={styles.doneText}>Done</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>Daily Tasks</Text>

        <Text style={styles.balance}>
          Balance:{" "}
          <Text style={styles.balanceValue}>
            {Number(balance || 0).toFixed(2)}
          </Text>
        </Text>
      </View>

      {/* TASK LIST */}

      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTask}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No tasks available right now</Text>
        }
      />
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
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 16,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
  },

  balance: {
    fontSize: 15,
    color: Colors.gray,
    marginTop: 4,
  },

  balanceValue: {
    color: Colors.primary,
    fontWeight: "700",
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  cardDone: {
    opacity: 0.7,
  },

  cardLeft: {
    flex: 1,
    marginRight: 12,
  },

  taskTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
  },

  textDone: {
    textDecorationLine: "line-through",
    color: Colors.gray,
  },

  taskDesc: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
    lineHeight: 20,
  },

  reward: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
    marginTop: 8,
  },

  timerText: {
    fontSize: 12,
    color: "#F59E0B",
    marginTop: 6,
    fontWeight: "600",
  },

  buttonColumn: {
    alignItems: "flex-end",
    gap: 8,
  },

  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  startBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },

  completeBtn: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  completeBtnDisabled: {
    backgroundColor: "#94A3B8",
  },

  completeBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },

  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  doneText: {
    color: "#16A34A",
    fontWeight: "700",
    fontSize: 13,
  },

  empty: {
    textAlign: "center",
    color: Colors.gray,
    marginTop: 40,
    fontSize: 16,
  },
});

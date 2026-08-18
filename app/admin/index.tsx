import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { Colors } from '../../constants/Colors';

const ADMIN_PIN = '9999';

export default function AdminScreen() {
  const router = useRouter();
  const { tasks, addTask, editTask, deleteTask, resetAllTasks } = useUser();

  const [isAuth, setIsAuth] = useState(false);
  const [pin, setPin] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [reward, setReward] = useState('5');
  const [taskType, setTaskType] = useState<
  'watch_ad' | 'watch_video' | 'referral' | 'profile' | 'social'
>('watch_video');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleLogin = () => {
    if (pin === ADMIN_PIN) {
      setIsAuth(true);
      setPin('');
    } else {
      Alert.alert('Wrong PIN', 'Access denied');
      setPin('');
    }
  };

  const handleSave = async () => {
  if (!title.trim() || !description.trim()) {
    Alert.alert(
      'Error',
      'Please fill title and description'
    );
    return;
  }

  const rewardValue =
    parseInt(reward, 10) || 5;

  try {
    if (editingId) {
  await editTask(
    editingId,
    title.trim(),
    description.trim(),
    rewardValue
  );

  Alert.alert(
    'Updated',
    'Task updated successfully'
  );

} else {
  await addTask(
    title.trim(),
    description.trim(),
    rewardValue,
    taskType
  );

  Alert.alert(
    'Added',
    'New task created'
  );
}

    setTitle('');
    setDescription('');
    setReward('5');
    setEditingId(null);
    setTaskType('watch_video');

  } catch (error: any) {
    console.error(
      'SAVE TASK ERROR:',
      error
    );

    Alert.alert(
      'Error',
      error?.message ||
        'Failed to save task'
    );
  }
};
  const startEdit = (task: any) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setReward(String(task.reward || 5));
  };

  const handleDelete = (id: string, taskTitle: string) => {
    Alert.alert('Delete Task?', `Remove "${taskTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
  try {
    await deleteTask(id);

    if (editingId === id) {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setReward('5');
    }

    Alert.alert(
      'Deleted',
      'Task deleted from database successfully'
    );
  } catch (error: any) {
    Alert.alert(
      'Error',
      error?.message ||
        'Failed to delete task'
    );
  }
},
      },
    ]);
  };

  if (!isAuth) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginBox}>
          <Text style={styles.loginTitle}>Admin Access</Text>
          <Text style={styles.loginSub}>Enter PIN to continue</Text>

          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholder="••••"
            placeholderTextColor="#94A3B8"
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Unlock</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>Demo PIN: 9999</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Admin Dashboard</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editingId ? 'Edit Task' : 'Add New Task'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Task title"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Description (paste YouTube link here)"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Coins reward (e.g. 5, 10, 20)"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={reward}
            onChangeText={setReward}
          />
         <Text style={styles.typeLabel}>
  Task Type
</Text>

<View style={styles.typeContainer}>

  <TouchableOpacity
    style={[
      styles.typeButton,
      taskType === 'watch_video' &&
        styles.typeButtonActive,
    ]}
    onPress={() =>
      setTaskType('watch_video')
    }
  >
    <Text
      style={[
        styles.typeText,
        taskType === 'watch_video' &&
          styles.typeTextActive,
      ]}
    >
      Watch Video
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.typeButton,
      taskType === 'watch_ad' &&
        styles.typeButtonActive,
    ]}
    onPress={() =>
      setTaskType('watch_ad')
    }
  >
    <Text
      style={[
        styles.typeText,
        taskType === 'watch_ad' &&
          styles.typeTextActive,
      ]}
    >
      Watch Ad
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.typeButton,
      taskType === 'social' &&
        styles.typeButtonActive,
    ]}
    onPress={() =>
      setTaskType('social')
    }
  >
    <Text
      style={[
        styles.typeText,
        taskType === 'social' &&
          styles.typeTextActive,
      ]}
    >
      Social
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.typeButton,
      taskType === 'profile' &&
        styles.typeButtonActive,
    ]}
    onPress={() =>
      setTaskType('profile')
    }
  >
    <Text
      style={[
        styles.typeText,
        taskType === 'profile' &&
          styles.typeTextActive,
      ]}
    >
      Profile
    </Text>
  </TouchableOpacity>

</View>

          <View style={styles.formButtons}>
            {editingId && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setEditingId(null);
                  setTitle('');
                  setDescription('');
                  setReward('5');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>
                {editingId ? 'Update Task' : 'Add Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RESET BUTTON */}
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => {
            Alert.alert(
              'Reset All Tasks?',
              'This will delete all current tasks and restore the default ones.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => {
                    resetAllTasks();
                    setEditingId(null);
                    setTitle('');
                    setDescription('');
                    setReward('5');
                    Alert.alert('Done', 'All tasks have been reset');
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.resetBtnText}>Reset All Tasks</Text>
        </TouchableOpacity>

        <Text style={styles.listTitle}>All Tasks ({tasks.length})</Text>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={styles.taskReward}>+{item.reward} coins</Text>
              </View>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => startEdit(item)}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.title)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loginBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  loginTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  loginSub: { color: Colors.gray, marginTop: 8, marginBottom: 30 },
  pinInput: {
    backgroundColor: Colors.white, width: 160, fontSize: 28, textAlign: 'center',
    letterSpacing: 10, padding: 14, borderRadius: 12, borderWidth: 2,
    borderColor: Colors.primary, marginBottom: 20,
  },
  loginBtn: { backgroundColor: Colors.primary, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  loginBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  backText: { color: Colors.gray, marginTop: 24, fontSize: 16 },
  hint: { color: '#94A3B8', marginTop: 30, fontSize: 13 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  back: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  form: {
    backgroundColor: Colors.white, marginHorizontal: 16, borderRadius: 16,
    padding: 16, marginBottom: 12, elevation: 2,
  },
  formTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, color: Colors.text },
  input: {
    backgroundColor: '#F1F5F9', borderRadius: 10, padding: 12,
    fontSize: 15, marginBottom: 10, color: Colors.text,
  },
  formButtons: { flexDirection: 'row', gap: 10, marginTop: 6 },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  saveText: { color: Colors.white, fontWeight: '700' },
  cancelBtn: { padding: 14, borderRadius: 10, backgroundColor: '#E2E8F0', paddingHorizontal: 20 },
  cancelText: { color: Colors.text, fontWeight: '600' },
  resetBtn: {
    backgroundColor: '#FEE2E2', marginHorizontal: 16, marginBottom: 16,
    padding: 14, borderRadius: 12, alignItems: 'center',
  },
  resetBtnText: { color: Colors.danger, fontWeight: '700', fontSize: 15 },
  listTitle: { fontSize: 16, fontWeight: '700', marginLeft: 20, marginBottom: 10, color: Colors.text },
  taskItem: {
    backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center',
  },
  taskTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  taskDesc: { fontSize: 13, color: Colors.gray, marginTop: 2 },
  taskReward: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 4 },
  editBtn: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  editText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  deleteBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  deleteText: { color: Colors.danger, fontWeight: '600', fontSize: 13 },

 typeLabel: {
  fontSize: 14,
  fontWeight: '700',
  color: Colors.text,
  marginBottom: 8,
},

typeContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 10,
},

typeButton: {
  paddingHorizontal: 12,
  paddingVertical: 9,
  borderRadius: 10,
  backgroundColor: '#E2E8F0',
},

typeButtonActive: {
  backgroundColor: Colors.primary,
},

typeText: {
  color: Colors.text,
  fontWeight: '600',
  fontSize: 12,
},

typeTextActive: {
  color: Colors.white,
},
});
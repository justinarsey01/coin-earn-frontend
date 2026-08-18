import { Stack } from 'expo-router';
import { UserProvider, useUser } from '../context/UserContext';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from '../components/LoadingScreen';

function RootNavigator() {
  const { isLoggedIn, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();
    useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!isLoggedIn && !inAuthGroup) {
      // Not logged in → go to register
      router.replace('/login');
    } else if (isLoggedIn && inAuthGroup) {
      // Logged in but on auth screen → go to tabs
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, isLoading, segments]);

  // Show loading screen while checking if user is logged in
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="admin/index" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <UserProvider>
            <RootNavigator />
          </UserProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
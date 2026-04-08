import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

// 1. Initial route settings: Tells the router to prioritize the tabs group
export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth(); // Access the login state from our Context
  const segments = useSegments(); // Get the current navigation path segments
  const router = useRouter(); // Hook to trigger redirects

  // 2. The Navigation Logic (The "Security Guard")
  useEffect(() => {
    if (loading) return; // Wait until we've checked the local storage for a session

    // Casting segments[0] as string to satisfy the TypeScript compiler 
    // while it re-indexes your new route folders.
    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      // Using /login as the route since it's inside the (auth) group
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* We define our two main groups: Authentication and the Main App (Tabs) */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// 3. The Main Entry Point: Wraps everything in the Auth provider
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

import { Stack } from 'expo-router';
import { Platform, StatusBar, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width, height } = Dimensions.get('window');

/**
 * Enhanced AuthLayout with custom transitions and modal support
 */
export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Custom screen options based on platform
  const getScreenOptions = () => {
    if (Platform.OS === 'ios') {
      return {
        animation: 'slide_from_right' as const,
        presentation: 'card' as const,
        gestureEnabled: true,
      };
    } else if (Platform.OS === 'android') {
      return {
        animation: 'fade_from_bottom' as const,
        presentation: 'card' as const,
      };
    } else {
      return {
        animation: 'default' as const,
      };
    }
  };

  return (
    <>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
        animated
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
          ...getScreenOptions(),
          // Full-screen modal options
          fullScreenGestureEnabled: Platform.OS === 'ios',
          // Status bar configuration
          statusBarHidden: false,
          statusBarStyle: 'light',
          statusBarTranslucent: true,
          statusBarAnimation: 'slide',
          // Navigation bar color (Android)
          navigationBarColor: 'transparent',
          navigationBarHidden: Platform.OS === 'android',
        }}
      >
        <Stack.Screen 
          name="login" 
          options={{
            title: 'Login',
            animation: (Platform.OS === 'ios' ? 'slide_from_right' : 'fade') as any,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="register" 
          options={{
            title: 'Register',
            animation: (Platform.OS === 'ios' ? 'slide_from_right' : 'fade') as any,
            gestureEnabled: true,
          }}
        />
      </Stack>
    </>
  );
}
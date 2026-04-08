import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          backgroundColor: isDark ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderRadius: 35,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          ...Platform.select({
            ios: {
              backgroundColor: isDark ? 'rgba(18, 18, 18, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            },
          }),
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: isDark ? '#666' : '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol 
                size={24} 
                name={focused ? "house.fill" : "house"} 
                color={color} 
              />
              {focused && <View style={[styles.dot, { backgroundColor: '#FF6B35' }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol 
                size={24} 
                name={focused ? "figure.walk" : "figure.walk"} 
                color={color} 
              />
              {focused && <View style={[styles.dot, { backgroundColor: '#FF6B35' }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ai-insights"
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol 
                size={24} 
                name={focused ? "sparkles" : "sparkles"} 
                color={color} 
              />
              {focused && <View style={[styles.dot, { backgroundColor: '#FF6B35' }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <IconSymbol 
                size={24} 
                name={focused ? "person.circle.fill" : "person.circle"} 
                color={color} 
              />
              {focused && <View style={[styles.dot, { backgroundColor: '#FF6B35' }]} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
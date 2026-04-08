import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { authService, userService } from '../services/apiService';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  fitness_goals: string[];
  activity_level: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileState: (newProfile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedUser = await storage.getItem('user');
      const storedProfile = await storage.getItem('profile');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      const { user, profile, session } = response;

      setUser(user);
      setProfile(profile);

      await storage.setItem('user', JSON.stringify(user));
      if (profile) await storage.setItem('profile', JSON.stringify(profile));
      
      // Navigate to dashboard
      router.replace('/(tabs)');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      const { user, profile } = response;

      setUser(user);
      setProfile(profile);

      await storage.setItem('user', JSON.stringify(user));
      await storage.setItem('profile', JSON.stringify(profile));

      // Navigate to dashboard
      router.replace('/(tabs)');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await storage.deleteItem('user');
      await storage.deleteItem('profile');
      setUser(null);
      setProfile(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileState = (newProfile: Profile) => {
    setProfile(newProfile);
    storage.setItem('profile', JSON.stringify(newProfile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

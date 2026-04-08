import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Dimensions,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Pedometer } from 'expo-sensors';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { DashboardCard } from '@/components/DashboardCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WeeklyChart } from '@/components/WeeklyChart';
import { activityService, aiService } from '@/services/apiService';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

/**
 * Premium AI Fitness Dashboard - Enhanced UI
 */
export default function DashboardScreen() {
  const { user } = useAuth();
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const STEP_GOAL = 10000;
  const CALORIE_GOAL = 500;
  
  const caloriesBurned = Math.round(currentStepCount * 0.04);
  const progressPercent = Math.min((currentStepCount / STEP_GOAL) * 100, 100);

  // Animation values
  const pulseAnim = useSharedValue(1);
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    ringProgress.value = withSpring(progressPercent / 100);
    pulseAnim.value = withRepeat(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progressPercent]);

  useEffect(() => {
    let subscription: any = null;
    const subscribe = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(String(isAvailable));
      if (isAvailable) {
        subscription = Pedometer.watchStepCount((result) => {
          setCurrentStepCount(result.steps);
        });
      }
    };

    if (Platform.OS !== 'web') {
      subscribe();
    } else {
      setIsPedometerAvailable('false');
    }
    return () => subscription && subscription.remove();
  }, [isTracking]);

  useEffect(() => {
    if (user?.id) {
      fetchAiRecommendation();
      fetchWeeklyStats();
    }
  }, [user?.id]);

  const fetchWeeklyStats = async () => {
    if (!user?.id) return;
    try {
      const data = await activityService.getWeeklyStats(user.id);
      setWeeklyStats(data.stats);
    } catch (error) {
      console.error('Weekly stats fetch failed:', error);
    }
  };

  const fetchAiRecommendation = async () => {
    if (!user?.id) return;
    try {
      setIsAiLoading(true);
      const data = await aiService.getRecommendation(user.id);
      setAiRecommendation(data.recommendation);
    } catch (error) {
      console.error('AI Fetch failed:', error);
      setAiRecommendation("✨ Ready for your personalized AI coaching? Connect your fitness data to unlock insights!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const syncActivity = async () => {
    if (currentStepCount === 0) return;
    try {
      setIsTracking(true);
      await activityService.logActivity({
        userId: user?.id,
        steps: currentStepCount,
        calories: caloriesBurned,
        duration: 30,
        activityType: 'walking'
      });
      setLastSynced(new Date());
      // Haptic feedback would go here in production
      alert('🎉 Activity synced successfully! Great job!');
    } catch (error: any) {
      alert('Sync failed: ' + error.message);
    } finally {
      setIsTracking(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchWeeklyStats(), fetchAiRecommendation()]);
    setRefreshing(false);
  };

  const simulateWalk = () => setCurrentStepCount(prev => Math.min(prev + 500, STEP_GOAL * 1.5));
  const resetMock = () => setCurrentStepCount(0);

  const getMotivationalMessage = () => {
    if (progressPercent >= 100) return "🎉 Amazing! Goal crushed!";
    if (progressPercent >= 75) return "🔥 Almost there! Keep pushing!";
    if (progressPercent >= 50) return "💪 Halfway! You've got this!";
    if (progressPercent >= 25) return "🌟 Great start! Keep going!";
    return "🚀 Let's get moving! Every step counts!";
  };

  const renderProgressRing = () => {
    const size = 200;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
      <View style={styles.ringContainer}>
        <Svg width={size} height={size}>
          <Defs>
            <SvgGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FF6B35" />
              <Stop offset="100%" stopColor="#FF8C42" />
            </SvgGradient>
          </Defs>
          {/* Background Circle */}
          <Circle 
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            stroke="#E8E8E8" 
            strokeWidth={strokeWidth} 
            fill="transparent" 
            strokeOpacity={0.3} 
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            stroke="url(#grad)" 
            strokeWidth={strokeWidth}
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" 
            fill="transparent" 
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.ringTextContainer}>
          <ThemedText style={styles.ringMainValue}>{Math.round(progressPercent)}<ThemedText style={styles.ringPercent}>%</ThemedText></ThemedText>
          <ThemedText style={styles.ringLabel}>of daily goal</ThemedText>
          <View style={styles.motivationBadge}>
            <ThemedText style={styles.motivationText}>{getMotivationalMessage()}</ThemedText>
          </View>
        </View>
      </View>
    );
  };

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />
      }
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#FF6B35', '#FF8C42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>Hello, {user?.email?.split('@')[0] || 'Athlete'}! 👋</ThemedText>
            <ThemedText style={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.avatarButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.avatarGradient}
            >
              <IconSymbol name="person.crop.circle.fill" size={44} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Quick Stats Row */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <IconSymbol name="flame.fill" size={20} color="#FFD700" />
            <ThemedText style={styles.quickStatValue}>{caloriesBurned}</ThemedText>
            <ThemedText style={styles.quickStatLabel}>Calories</ThemedText>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <IconSymbol name="clock.fill" size={20} color="#FFF" />
            <ThemedText style={styles.quickStatValue}>30</ThemedText>
            <ThemedText style={styles.quickStatLabel}>Active Min</ThemedText>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <IconSymbol name="heart.fill" size={20} color="#FF6B6B" />
            <ThemedText style={styles.quickStatValue}>72</ThemedText>
            <ThemedText style={styles.quickStatLabel}>Heart Rate</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Main Progress Ring */}
      <View style={styles.mainProgressContainer}>
        {renderProgressRing()}
        
        <View style={styles.progressDetails}>
          <View style={styles.statDetail}>
            <ThemedText style={styles.statDetailValue}>{currentStepCount.toLocaleString()}</ThemedText>
            <ThemedText style={styles.statDetailLabel}>Current Steps</ThemedText>
          </View>
          <View style={styles.statDetailSeparator} />
          <View style={styles.statDetail}>
            <ThemedText style={styles.statDetailValue}>{STEP_GOAL.toLocaleString()}</ThemedText>
            <ThemedText style={styles.statDetailLabel}>Daily Goal</ThemedText>
          </View>
          <View style={styles.statDetailSeparator} />
          <View style={styles.statDetail}>
            <ThemedText style={styles.statDetailValue}>{Math.round((currentStepCount / STEP_GOAL) * 100)}%</ThemedText>
            <ThemedText style={styles.statDetailLabel}>Completed</ThemedText>
          </View>
        </View>

        {/* Sync Button */}
        <TouchableOpacity style={styles.syncButton} onPress={syncActivity} disabled={isTracking}>
          <LinearGradient
            colors={['#FF6B35', '#FF8C42']}
            style={styles.syncGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <IconSymbol name={isTracking ? "clock" : "icloud.and.arrow.up"} size={20} color="#FFF" />
            <ThemedText style={styles.syncButtonText}>
              {isTracking ? 'Syncing...' : 'Sync Activity'}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        {lastSynced && (
          <ThemedText style={styles.lastSynced}>
            Last synced: {lastSynced.toLocaleTimeString()}
          </ThemedText>
        )}
      </View>

      {/* AI Coach Card with Glassmorphism */}
      <BlurView intensity={20} tint="light" style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <LinearGradient
            colors={['#FF6B35', '#FF8C42']}
            style={styles.aiIconGradient}
          >
            <IconSymbol name="sparkles" size={24} color="#FFF" />
          </LinearGradient>
          <View style={styles.aiHeaderText}>
            <ThemedText style={styles.aiTitle}>AI Fitness Coach</ThemedText>
            <ThemedText style={styles.aiSubtitle}>Personalized for you</ThemedText>
          </View>
          {isAiLoading && (
            <View style={styles.loadingDot}>
              <Animated.View style={[styles.pulsingDot, animatedRingStyle]} />
            </View>
          )}
        </View>
        
        <ThemedText style={styles.aiRecommendationText}>
          {isAiLoading ? "🤖 Analyzing your fitness patterns..." : aiRecommendation || "✨ Ready for insights? Start moving to get personalized coaching!"}
        </ThemedText>
        
        <TouchableOpacity style={styles.aiActionButton}>
          <ThemedText style={styles.aiActionText}>Get Detailed Analysis →</ThemedText>
        </TouchableOpacity>
      </BlurView>

      {/* Weekly Activity Chart */}
      <View style={styles.chartSection}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="chart.bar.fill" size={22} color="#FF6B35" />
          <ThemedText style={styles.sectionTitle}>Weekly Activity</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.seeAllText}>Details →</ThemedText>
          </TouchableOpacity>
        </View>
        
        <WeeklyChart 
          data={weeklyStats.length > 0 ? weeklyStats : [
            { day: '1', label: 'Mon', steps: 4000 }, { day: '2', label: 'Tue', steps: 7500 },
            { day: '3', label: 'Wed', steps: 6000 }, { day: '4', label: 'Thu', steps: 9000 },
            { day: '5', label: 'Fri', steps: 3000 }, { day: '6', label: 'Sat', steps: 11000 },
            { day: '7', label: 'Sun', steps: 5000 }
          ]} 
          goal={STEP_GOAL} 
        />
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <DashboardCard
          title="Calories Burned"
          value={caloriesBurned}
          unit="kcal"
          accentColor="#FF6B35"
          icon={<IconSymbol name="flame.fill" size={24} color="#FF6B35" />}
          subtitle={`${Math.min(Math.round((caloriesBurned/CALORIE_GOAL)*100), 100)}% of daily target`}
          style={styles.gridCard}
        />
        <DashboardCard
          title="Active Minutes"
          value={30}
          unit="mins"
          accentColor="#4ECDC4"
          icon={<IconSymbol name="timer" size={24} color="#4ECDC4" />}
          subtitle="+15% vs yesterday"
          style={styles.gridCard}
        />
        <DashboardCard
          title="Distance"
          value={(currentStepCount * 0.000762).toFixed(2)}
          unit="km"
          accentColor="#9B59B6"
          icon={<IconSymbol name="map.fill" size={24} color="#9B59B6" />}
          subtitle="≈ 0.47 miles"
          style={styles.gridCard}
        />
        <DashboardCard
          title="Fitness Score"
          value={Math.min(Math.round((currentStepCount / STEP_GOAL) * 100), 100)}
          unit="pts"
          accentColor="#FFD700"
          icon={<IconSymbol name="star.fill" size={24} color="#FFD700" />}
          subtitle="Keep it up!"
          style={styles.gridCard}
        />
      </View>

      {/* Web Simulation Controls (Preserved) */}
      {Platform.OS === 'web' && (
        <BlurView intensity={30} tint="light" style={styles.simulationContainer}>
          <ThemedText style={styles.simulationTitle}>🧪 Development Tools</ThemedText>
          <View style={styles.simulationButtons}>
            <TouchableOpacity style={styles.simButton} onPress={simulateWalk}>
              <IconSymbol name="plus" size={16} color="#FFF" />
              <ThemedText style={styles.simButtonText}>+500 Steps</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.simButton, styles.simButtonReset]} onPress={resetMock}>
              <IconSymbol name="arrow.counterclockwise" size={16} color="#FFF" />
              <ThemedText style={styles.simButtonText}>Reset</ThemedText>
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    paddingBottom: 40,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  avatarButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  avatarGradient: {
    padding: 4,
    borderRadius: 30,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
  },
  quickStat: {
    alignItems: 'center',
    gap: 6,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  mainProgressContainer: {
    alignItems: 'center',
    padding: 24,
    marginTop: -30,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  ringContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  ringTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringMainValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  ringPercent: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF6B35',
  },
  ringLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  motivationBadge: {
    backgroundColor: '#FF6B3510',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  motivationText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 16,
  },
  statDetail: {
    alignItems: 'center',
    flex: 1,
  },
  statDetailValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  statDetailLabel: {
    fontSize: 11,
    color: '#999',
  },
  statDetailSeparator: {
    width: 1,
    height: 30,
    backgroundColor: '#F0F0F0',
  },
  syncButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  syncGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  syncButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  lastSynced: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
  },
  aiCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  aiIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiHeaderText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  loadingDot: {
    width: 8,
    height: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
  },
  aiRecommendationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 16,
  },
  aiActionButton: {
    alignSelf: 'flex-start',
  },
  aiActionText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  chartSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
  },
  seeAllText: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12,
  },
  gridCard: {
    width: (width - 52) / 2,
    borderRadius: 20,
  },
  simulationContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  simulationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  simulationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  simButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  simButtonReset: {
    backgroundColor: '#e74c3c',
  },
  simButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
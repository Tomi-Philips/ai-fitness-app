import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  TouchableOpacity, 
  Platform,
  ScrollView,
  ColorValue
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { 
  Rect, 
  Text as SvgText, 
  G, 
  Line, 
  Defs, 
  LinearGradient as SvgGradient, 
  Stop,
  Circle
} from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withSpring,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { ThemedText } from './themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface DailyStat {
  day: string;
  label: string;
  steps: number;
}

interface WeeklyChartProps {
  data: DailyStat[];
  goal: number;
  showTooltips?: boolean;
  onBarPress?: (day: DailyStat) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export function WeeklyChart({ 
  data, 
  goal, 
  showTooltips = true, 
  onBarPress,
  variant = 'default'
}: WeeklyChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  const screenWidth = Dimensions.get('window').width - (variant === 'compact' ? 32 : 40);
  const chartHeight = variant === 'compact' ? 120 : 180;
  const barWidth = variant === 'compact' ? 28 : 36;
  const spacing = (screenWidth - (barWidth * 7)) / 8;
  
  const maxSteps = Math.max(...data.map(d => d.steps), goal);
  const averageSteps = Math.floor(data.reduce((sum, d) => sum + d.steps, 0) / data.length);
  const totalSteps = data.reduce((sum, d) => sum + d.steps, 0);
  
  // Animation values for each bar
  const animatedHeights = data.map(() => useSharedValue(0));
  
  useEffect(() => {
    // Animate bars on mount
    data.forEach((_, index) => {
      animatedHeights[index].value = withDelay(
        index * 100,
        withSpring(1, { damping: 12, stiffness: 100 })
      );
    });
  }, []);
  
  const getBarColor = (steps: number): [ColorValue, ColorValue] => {
    const percentage = (steps / goal) * 100;
    if (percentage >= 100) return ['#4ECDC4', '#2ecc71'];
    if (percentage >= 75) return ['#FF8C42', '#FF6B35'];
    if (percentage >= 50) return ['#FFD700', '#FFA500'];
    return ['#9B59B6', '#8E44AD'];
  };
  
  const getBarOpacity = (steps: number) => {
    const percentage = (steps / goal) * 100;
    return Math.min(percentage / 100 + 0.3, 1);
  };
  
  const formatSteps = (steps: number) => {
    if (steps >= 1000) return `${(steps / 1000).toFixed(1)}k`;
    return steps.toString();
  };
  
  const handleBarPress = (index: number, day: DailyStat) => {
    setSelectedBar(index);
    setTooltipVisible(true);
    setTimeout(() => setTooltipVisible(false), 2000);
    onBarPress?.(day);
  };
  
  const renderTooltip = (index: number, steps: number) => {
    if (!showTooltips || selectedBar !== index || !tooltipVisible) return null;
    
    const x = spacing + index * (barWidth + spacing) + barWidth / 2;
    const y = chartHeight - (steps / maxSteps) * chartHeight - 35;
    
    return (
      <G>
        <Rect
          x={x - 40}
          y={y - 30}
          width={80}
          height={28}
          rx={14}
          fill={isDark ? '#1C1C1E' : '#FFFFFF'}
          fillOpacity={0.95}
          stroke={getBarColor(steps)[0]}
          strokeWidth={1}
        />
        <SvgText
          x={x}
          y={y - 12}
          fill={getBarColor(steps)[0]}
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          {formatSteps(steps)} steps
        </SvgText>
      </G>
    );
  };
  
  if (variant === 'compact') {
    return (
      <View style={[styles.container, styles.compactContainer, isDark && styles.containerDark]}>
        <View style={styles.compactHeader}>
          <View style={styles.titleSection}>
            <LinearGradient
              colors={['#FF6B35', '#FF8C42']}
              style={styles.titleAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <ThemedText style={styles.compactTitle}>Weekly Steps</ThemedText>
          </View>
          <View style={styles.compactStats}>
            <ThemedText style={styles.compactStat}>
              Avg: {formatSteps(averageSteps)}
            </ThemedText>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.compactBarsContainer}>
            {data.map((item, index) => {
              const percentage = (item.steps / goal) * 100;
              return (
                <TouchableOpacity
                  key={item.day}
                  style={styles.compactBarWrapper}
                  onPress={() => handleBarPress(index, item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.compactBarLabel}>
                    <ThemedText style={styles.compactBarValue}>
                      {formatSteps(item.steps)}
                    </ThemedText>
                  </View>
                  <View style={styles.compactBarBackground}>
                    <LinearGradient
                      colors={getBarColor(item.steps)}
                      style={[styles.compactBarFill, { height: `${Math.min(percentage, 100)}%` }]}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                    />
                  </View>
                  <ThemedText style={styles.compactDayLabel}>{item.label}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }
  
  if (variant === 'detailed') {
    return (
      <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={styles.detailedContainer}>
        <View style={styles.detailedHeader}>
          <View>
            <ThemedText style={styles.detailedTitle}>Weekly Performance</ThemedText>
            <ThemedText style={styles.detailedSubtitle}>
              {totalSteps.toLocaleString()} total steps this week
            </ThemedText>
          </View>
          <View style={styles.goalBadge}>
            <LinearGradient
              colors={['#FF6B35', '#FF8C42']}
              style={styles.goalBadgeGradient}
            >
              <ThemedText style={styles.goalBadgeText}>
                Goal: {formatSteps(goal)}
              </ThemedText>
            </LinearGradient>
          </View>
        </View>
        
        <Svg width={screenWidth} height={chartHeight + 50}>
          <Defs>
            {data.map((item, index) => {
              const colors = getBarColor(item.steps);
              return (
                <SvgGradient
                  key={`grad-${index}`}
                  id={`barGradient-${index}`}
                  x1="0"
                  y1="1"
                  x2="0"
                  y2="0"
                >
                  <Stop offset="0%" stopColor={colors[1]} stopOpacity="1" />
                  <Stop offset="100%" stopColor={colors[0]} stopOpacity="1" />
                </SvgGradient>
              );
            })}
          </Defs>
          
          <G>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = chartHeight - (percent / 100) * chartHeight;
              return (
                <G key={percent}>
                  <Line
                    x1={0}
                    y1={y}
                    x2={screenWidth}
                    y2={y}
                    stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                    strokeWidth={1}
                    strokeDasharray="5,5"
                  />
                  <SvgText
                    x={5}
                    y={y - 4}
                    fill={isDark ? '#9BA1A6' : '#687076'}
                    fontSize="10"
                  >
                    {percent}%
                  </SvgText>
                </G>
              );
            })}
            
            {/* Goal line */}
            <Line
              x1={0}
              y1={chartHeight - (goal / maxSteps) * chartHeight}
              x2={screenWidth}
              y2={chartHeight - (goal / maxSteps) * chartHeight}
              stroke="#FF6B35"
              strokeWidth={2}
              strokeDasharray="8,4"
              opacity={0.8}
            />
            <SvgText
              x={screenWidth - 40}
              y={chartHeight - (goal / maxSteps) * chartHeight - 4}
              fill="#FF6B35"
              fontSize="10"
              fontWeight="bold"
            >
              Goal
            </SvgText>
            
            {/* Bars */}
            {data.map((item, index) => {
              const barHeight = (item.steps / maxSteps) * chartHeight;
              const x = spacing + index * (barWidth + spacing);
              const isGoalMet = item.steps >= goal;
              
              return (
                <G key={item.day}>
                  {/* Background */}
                  <Rect
                    x={x}
                    y={0}
                    width={barWidth}
                    height={chartHeight}
                    fill={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}
                    rx={barWidth / 2}
                  />
                  
                  {/* Animated Bar */}
                  <AnimatedRect
                    x={x}
                    y={chartHeight - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill={`url(#barGradient-${index})`}
                    rx={barWidth / 2}
                    opacity={getBarOpacity(item.steps)}
                  />
                  
                  {/* Bar shine effect */}
                  <Rect
                    x={x + 2}
                    y={chartHeight - barHeight + 2}
                    width={barWidth - 4}
                    height={Math.min(4, barHeight - 4)}
                    fill="rgba(255,255,255,0.2)"
                    rx={2}
                  />
                  
                  {/* Day Label */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={chartHeight + 25}
                    fill={isDark ? '#9BA1A6' : '#687076'}
                    fontSize="12"
                    fontWeight={selectedBar === index ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {item.label}
                  </SvgText>
                  
                  {/* Achievement indicator */}
                  {isGoalMet && (
                    <Circle
                      cx={x + barWidth / 2}
                      cy={chartHeight + 12}
                      r={4}
                      fill="#2ecc71"
                    />
                  )}
                  
                  {/* Tooltip */}
                  {renderTooltip(index, item.steps)}
                </G>
              );
            })}
          </G>
        </Svg>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
            <ThemedText style={styles.legendText}>Goal Met</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF8C42' }]} />
            <ThemedText style={styles.legendText}>75%+</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
            <ThemedText style={styles.legendText}>50%+</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9B59B6' }]} />
            <ThemedText style={styles.legendText}>Below 50%</ThemedText>
          </View>
        </View>
      </BlurView>
    );
  }
  
  // Default variant
  return (
    <LinearGradient
      colors={isDark ? ['#1C1C1E', '#2C2C2E'] as [ColorValue, ColorValue] : ['#FFFFFF', '#F8F9FA'] as [ColorValue, ColorValue]}
      style={styles.defaultContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Weekly Activity</ThemedText>
          <ThemedText style={styles.subtitle}>
            {totalSteps.toLocaleString()} steps this week
          </ThemedText>
        </View>
        <View style={styles.averageBadge}>
          <ThemedText style={styles.averageText}>
            📊 Avg: {formatSteps(averageSteps)}
          </ThemedText>
        </View>
      </View>
      
      <Svg width={screenWidth} height={chartHeight + 30}>
        <Defs>
          <SvgGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF6B35" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FF8C42" stopOpacity="0.8" />
          </SvgGradient>
        </Defs>
        
        <G>
          {/* Goal line */}
          <Line
            x1={0}
            y1={chartHeight - (goal / maxSteps) * chartHeight}
            x2={screenWidth}
            y2={chartHeight - (goal / maxSteps) * chartHeight}
            stroke="url(#goalGradient)"
            strokeWidth={2}
            strokeDasharray="6,4"
          />
          
          {data.map((item, index) => {
            const barHeight = (item.steps / maxSteps) * chartHeight;
            const x = spacing + index * (barWidth + spacing);
            const isGoalMet = item.steps >= goal;
            const colors = getBarColor(item.steps);
            
            return (
              <G key={item.day}>
                {/* Bar shadow */}
                <Rect
                  x={x + 2}
                  y={chartHeight - barHeight + 2}
                  width={barWidth}
                  height={barHeight}
                  fill="rgba(0,0,0,0.1)"
                  rx={barWidth / 2}
                />
                
                {/* Main bar */}
                <Rect
                  x={x}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill={`url(#barGradient-${index})`}
                  rx={barWidth / 2}
                />
                
                {/* Day label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  fill={isDark ? '#9BA1A6' : '#687076'}
                  fontSize="11"
                  fontWeight={selectedBar === index ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {item.label}
                </SvgText>
                
                {/* Steps label on top of bar */}
                {barHeight > 30 && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={chartHeight - barHeight + 15}
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {formatSteps(item.steps)}
                  </SvgText>
                )}
                
                {/* Success indicator */}
                {isGoalMet && (
                  <Circle
                    cx={x + barWidth / 2}
                    cy={chartHeight + 8}
                    r={3}
                    fill="#2ecc71"
                  />
                )}
                
                {renderTooltip(index, item.steps)}
              </G>
            );
          })}
        </G>
      </Svg>
      
      <TouchableOpacity style={styles.insightButton}>
        <LinearGradient
          colors={['#FF6B3510', '#FF8C4210']}
          style={styles.insightGradient}
        >
          <ThemedText style={styles.insightText}>
            💡 {averageSteps >= goal ? 'Great week! Keep it up! 🎉' : `${formatSteps(goal - averageSteps)} more steps daily to reach goal`}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  defaultContainer: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  container: {
    marginVertical: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  averageBadge: {
    backgroundColor: '#FF6B3510',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  averageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
  insightButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  insightGradient: {
    padding: 12,
    alignItems: 'center',
  },
  insightText: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    opacity: 0.7,
  },
  // Compact variant styles
  compactContainer: {
    padding: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  compactStats: {
    backgroundColor: '#FF6B3510',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compactStat: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '600',
  },
  compactBarsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  compactBarWrapper: {
    alignItems: 'center',
    width: 50,
  },
  compactBarLabel: {
    marginBottom: 8,
  },
  compactBarValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  compactBarBackground: {
    width: 32,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  compactBarFill: {
    width: '100%',
    borderRadius: 16,
  },
  compactDayLabel: {
    fontSize: 11,
    marginTop: 8,
    opacity: 0.6,
  },
  // Detailed variant styles
  detailedContainer: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  detailedTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailedSubtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
  goalBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  goalBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  goalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
});
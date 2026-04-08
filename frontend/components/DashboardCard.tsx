import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ViewStyle, 
  Platform, 
  TouchableOpacity,
  Animated,
  Dimensions,
  ColorValue
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ThemedText } from './themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

interface DashboardCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  style?: ViewStyle;
  valueStyle?: any;
  accentColor?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'outline';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  onPress?: () => void;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function DashboardCard({
  title,
  value,
  unit,
  icon,
  subtitle,
  style,
  valueStyle,
  accentColor = '#FF6B35',
  variant = 'default',
  trend,
  trendValue,
  onPress,
  isLoading = false,
  size = 'medium',
}: DashboardCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Shimmer animation for loading state
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isLoading]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    if (trend === 'stable') return '➡️';
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#4ECDC4';
    if (trend === 'down') return '#FF6B6B';
    if (trend === 'stable') return '#FFD700';
    return accentColor;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.sizeSmall,
          value: styles.valueSmall,
          title: styles.titleSmall,
        };
      case 'large':
        return {
          container: styles.sizeLarge,
          value: styles.valueLarge,
          title: styles.titleLarge,
        };
      default:
        return {
          container: styles.sizeMedium,
          value: styles.valueMedium,
          title: styles.titleMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderCardContent = () => {
    const content = (
      <>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {variant === 'gradient' && (
              <LinearGradient
                colors={[accentColor, accentColor + '80'] as [ColorValue, ColorValue]}
                style={styles.titleAccent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
            <ThemedText 
              type="defaultSemiBold" 
              style={[styles.title, sizeStyles.title]}
              numberOfLines={1}
            >
              {title}
            </ThemedText>
          </View>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
        </View>

        {/* Value Section */}
        <View style={styles.content}>
          <View style={styles.valueRow}>
            {isLoading ? (
              <Animated.View
                style={[
                  styles.skeletonText,
                  {
                    opacity: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.7],
                    }),
                  },
                ]}
              />
            ) : (
              <>
                <ThemedText 
                  type="title" 
                  style={[
                    styles.value, 
                    sizeStyles.value,
                    { color: variant === 'gradient' ? '#FFF' : accentColor },
                    valueStyle
                  ]}
                >
                  {value}
                </ThemedText>
                {unit && (
                  <ThemedText 
                    type="defaultSemiBold" 
                    style={[
                      styles.unit,
                      variant === 'gradient' && styles.unitLight
                    ]}
                  >
                    {unit}
                  </ThemedText>
                )}
              </>
            )}
          </View>

          {/* Subtitle */}
          {subtitle && !isLoading && (
            <ThemedText 
              type="default" 
              style={[
                styles.subtitle,
                variant === 'gradient' && styles.subtitleLight
              ]}
            >
              {subtitle}
            </ThemedText>
          )}

          {/* Trend Indicator */}
          {trend && trendValue && !isLoading && (
            <View style={styles.trendContainer}>
              <ThemedText style={[styles.trendText, { color: getTrendColor() }]}>
                {getTrendIcon()} {trendValue}
              </ThemedText>
            </View>
          )}
        </View>
      </>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            {content}
          </Animated.View>
        </TouchableOpacity>
      );
    }

    return content;
  };

  // Render different variants
  if (variant === 'gradient') {
    return (
      <Animated.View 
        style={[
          styles.outerContainer,
          sizeStyles.container,
          style,
          { opacity: fadeAnim }
        ]}
      >
        <LinearGradient
          colors={[accentColor, accentColor + 'CC', accentColor + '99'] as [ColorValue, ColorValue, ColorValue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {renderCardContent()}
        </LinearGradient>
      </Animated.View>
    );
  }

  if (variant === 'glass') {
    return (
      <Animated.View 
        style={[
          styles.outerContainer,
          sizeStyles.container,
          style,
          { opacity: fadeAnim }
        ]}
      >
        <BlurView
          intensity={isDark ? 20 : 40}
          tint={isDark ? 'dark' : 'light'}
          style={styles.glassContainer}
        >
          {renderCardContent()}
        </BlurView>
      </Animated.View>
    );
  }

  if (variant === 'outline') {
    return (
      <Animated.View 
        style={[
          styles.outerContainer,
          sizeStyles.container,
          styles.outlineContainer,
          { borderColor: accentColor + '40', opacity: fadeAnim },
          style
        ]}
      >
        {renderCardContent()}
      </Animated.View>
    );
  }

  // Default variant
  return (
    <Animated.View 
      style={[
        styles.outerContainer,
        sizeStyles.container,
        !isDark && styles.containerLight,
        isDark && styles.containerDark,
        styles.defaultContainer,
        { opacity: fadeAnim },
        style
      ]}
    >
      {renderCardContent()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 20,
    overflow: 'hidden',
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
  defaultContainer: {
    borderWidth: 1,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gradientContainer: {
    padding: 20,
  },
  glassContainer: {
    padding: 20,
    overflow: 'hidden',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  // Size variants
  sizeSmall: {
    padding: 12,
    minHeight: 100,
  },
  sizeMedium: {
    padding: 20,
    minHeight: 140,
  },
  sizeLarge: {
    padding: 24,
    minHeight: 180,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  titleAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
    flex: 1,
  },
  titleSmall: {
    fontSize: 12,
  },
  titleMedium: {
    fontSize: 14,
  },
  titleLarge: {
    fontSize: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  value: {
    fontWeight: '800',
  },
  valueSmall: {
    fontSize: 24,
  },
  valueMedium: {
    fontSize: 32,
  },
  valueLarge: {
    fontSize: 40,
  },
  unit: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.6,
  },
  unitLight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.6,
  },
  subtitleLight: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  trendContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  skeletonText: {
    height: 32,
    width: '60%',
    backgroundColor: '#CCC',
    borderRadius: 8,
  },
});
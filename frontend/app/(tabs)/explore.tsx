import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Platform,
  ColorValue
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DashboardCard } from '@/components/DashboardCard';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Calculate fitness level based on data
  const getFitnessLevel = () => {
    if (!profile) return 'Beginner';
    const goalsCount = profile.fitness_goals?.length || 0;
    if (goalsCount >= 3) return 'Advanced 💪';
    if (goalsCount >= 2) return 'Intermediate ⚡';
    return 'Getting Started 🌱';
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Animated Gradient Header */}
      <LinearGradient
        colors={(isDark ? ['#1a1a2e', '#16213e'] : ['#FF6B35', '#FF8C42']) as [ColorValue, ColorValue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          {/* Avatar with Ring Effect */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              <IconSymbol 
                name="person.crop.circle.fill" 
                size={110} 
                color="#FFF" 
              />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <LinearGradient
                colors={['#FF6B35', '#FF8C42']}
                style={styles.editAvatarGradient}
              >
                <IconSymbol name="camera.fill" size={14} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <ThemedText style={styles.userName}>
            {user?.email?.split('@')[0] || 'Athlete'}
          </ThemedText>
          
          <View style={styles.userBadge}>
            <IconSymbol name="star.fill" size={14} color="#FFD700" />
            <ThemedText style={styles.userBadgeText}>{getFitnessLevel()}</ThemedText>
          </View>

          <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>

      {/* Stats Summary Cards */}
      <View style={styles.statsSummaryContainer}>
        <View style={styles.statsSummary}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {profile?.age || '--'}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Age</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {profile?.weight || '--'}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Weight (kg)</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {profile?.height || '--'}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Height (cm)</ThemedText>
          </View>
        </View>
      </View>

      {/* Physical Profile Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="heart.fill" size={22} color="#FF6B35" />
          <ThemedText style={styles.sectionTitle}>Physical Profile</ThemedText>
        </View>
        
        <View style={styles.statsGrid}>
          <DashboardCard
            title="Age"
            value={profile?.age || '--'}
            unit="years"
            style={styles.profileCard}
          />
          <DashboardCard
            title="Weight"
            value={profile?.weight || '--'}
            unit="kg"
            style={styles.profileCard}
          />
          <DashboardCard
            title="Height"
            value={profile?.height || '--'}
            unit="cm"
            style={styles.profileCard}
          />
          <DashboardCard
            title="Gender"
            value={profile?.gender || 'Not set'}
            style={styles.profileCard}
          />
        </View>
      </View>

      {/* Goals & Activity Section with Glassmorphism */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="target" size={22} color="#4ECDC4" />
          <ThemedText style={styles.sectionTitle}>Goals & Activity</ThemedText>
        </View>

        <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={styles.infoBox}>
          {/* Activity Level */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <IconSymbol name="bolt.fill" size={20} color="#FF6B35" />
            </View>
            <ThemedText style={styles.infoLabel}>Activity Level</ThemedText>
            <View style={styles.activityBadge}>
              <ThemedText style={styles.activityBadgeText}>
                {profile?.activity_level?.replace('_', ' ') || 'Moderate'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Fitness Goals */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <IconSymbol name="flag.fill" size={20} color="#4ECDC4" />
            </View>
            <ThemedText style={styles.infoLabel}>Fitness Goals</ThemedText>
          </View>

          <View style={styles.chipContainer}>
            {profile?.fitness_goals?.map((goal, index) => (
              <LinearGradient
                key={index}
                colors={['#FF6B35', '#FF8C42']}
                style={styles.chip}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <ThemedText style={styles.chipText}>
                  {goal.replace(/_/g, ' ')}
                </ThemedText>
              </LinearGradient>
            ))}
            {(!profile?.fitness_goals || profile.fitness_goals.length === 0) && (
              <View style={styles.emptyGoals}>
                <IconSymbol name="plus.circle" size={20} color="#999" />
                <ThemedText style={styles.emptyText}>No goals set yet</ThemedText>
              </View>
            )}
          </View>

          {/* Motivational Quote based on goals */}
          {profile?.fitness_goals && profile.fitness_goals.length > 0 && (
            <View style={styles.quoteContainer}>
              <IconSymbol name="quote.bubble" size={16} color="#FF6B35" />
              <ThemedText style={styles.quoteText}>
                "You're {Math.floor(Math.random() * 30) + 70}% closer to your {profile.fitness_goals[0].replace(/_/g, ' ')} goal!"
              </ThemedText>
            </View>
          )}
        </BlurView>
      </View>

      {/* Action Buttons with Gradient */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => alert('Settings coming soon! 🛠️')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8C42']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <IconSymbol name="gearshape.fill" size={20} color="#FFF" />
            <ThemedText style={styles.actionButtonText}>Edit Profile</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#FFF" style={styles.chevron} />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]} 
          onPress={handleLogout}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#e74c3c', '#c0392b']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FFF" />
            <ThemedText style={styles.actionButtonText}>Logout</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#FFF" style={styles.chevron} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <ThemedText style={styles.versionText}>Version 2.0.0 • AI-Powered Fitness</ThemedText>
      </View>
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
    paddingBottom: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },
  editAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 8,
  },
  userBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statsSummaryContainer: {
    paddingHorizontal: 20,
    marginTop: -25,
    marginBottom: 24,
  },
  statsSummary: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoBox: {
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,107,53,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  activityBadge: {
    backgroundColor: 'rgba(78,205,196,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityBadgeText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    overflow: 'hidden',
  },
  chipText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyGoals: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  quoteText: {
    fontSize: 12,
    color: '#FF6B35',
    flex: 1,
    fontStyle: 'italic',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    opacity: 0.8,
  },
  logoutButton: {
    shadowColor: '#e74c3c',
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    opacity: 0.7,
  },
});
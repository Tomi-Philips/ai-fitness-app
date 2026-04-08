import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [goals, setGoals] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Update progress bar animation
    Animated.timing(progressAnim, {
      toValue: (currentStep / 3) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!age || !weight || !height) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      Alert.alert('Error', 'Please enter a valid age (13-120)');
      return false;
    }
    
    if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
      Alert.alert('Error', 'Please enter a valid weight (20-300 kg)');
      return false;
    }
    
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      Alert.alert('Error', 'Please enter a valid height (100-250 cm)');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    if (goals.length === 0) {
      Alert.alert('Error', 'Please select at least one fitness goal');
      return;
    }

    try {
      await register({
        email,
        password,
        age,
        gender,
        weight,
        height,
        activityLevel,
        goals,
      });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Error creating account');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <TouchableOpacity key={step} onPress={() => step < currentStep && setCurrentStep(step)}>
          <View style={[
            styles.stepDot,
            currentStep >= step && styles.stepDotActive,
            step < currentStep && styles.stepDotCompleted
          ]}>
            {step < currentStep ? (
              <Text style={styles.stepDotText}>✓</Text>
            ) : (
              <Text style={styles.stepDotText}>{step}</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Email Address *</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>📧</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Password *</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password (min. 6 characters)"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.inputIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hintText}>Use at least 6 characters</Text>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Confirm Password *</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Text style={styles.inputIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.row}>
        <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Age *</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🎂</Text>
            <TextInput
              style={styles.input}
              placeholder="Years"
              placeholderTextColor="rgba(255,255,255,0.6)"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
              editable={!loading}
            />
          </View>
        </View>
        
        <View style={[styles.inputWrapper, { flex: 1 }]}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={gender}
              onChangeText={setGender}
              editable={!loading}
            />
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Weight (kg) *</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>⚖️</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 70"
              placeholderTextColor="rgba(255,255,255,0.6)"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              editable={!loading}
            />
          </View>
        </View>
        
        <View style={[styles.inputWrapper, { flex: 1 }]}>
          <Text style={styles.label}>Height (cm) *</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📏</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 175"
              placeholderTextColor="rgba(255,255,255,0.6)"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
              editable={!loading}
            />
          </View>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Activity Level</Text>
        <View style={styles.chipsContainer}>
          {['sedentary', 'lightly active', 'moderately active', 'very active'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.chip,
                activityLevel === level && styles.chipSelected,
              ]}
              onPress={() => setActivityLevel(level)}
            >
              <Text style={[
                styles.chipText,
                activityLevel === level && styles.chipTextSelected
              ]}>
                {level === 'sedentary' ? '🛋️ Sedentary' :
                 level === 'lightly active' ? '🚶 Lightly Active' :
                 level === 'moderately active' ? '🏃 Moderately Active' :
                 '💪 Very Active'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Fitness Goals (Select all that apply)</Text>
        <View style={styles.chipsContainer}>
          {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'Stress Relief', 'Better Sleep'].map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.chip,
                goals.includes(goal) && styles.chipSelected,
              ]}
              onPress={() => toggleGoal(goal)}
            >
              <Text style={[
                styles.chipText,
                goals.includes(goal) && styles.chipTextSelected
              ]}>
                {goal === 'Weight Loss' ? '🎯 ' :
                 goal === 'Muscle Gain' ? '💪 ' :
                 goal === 'Endurance' ? '🏃 ' :
                 goal === 'Flexibility' ? '🧘 ' :
                 goal === 'Stress Relief' ? '😌 ' :
                 '💤 '}{goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {goals.length > 0 && (
          <Text style={styles.selectedCount}>
            Selected: {goals.length} goal{goals.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Summary Card */}
      <BlurView intensity={15} style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Profile Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Email:</Text>
          <Text style={styles.summaryValue}>{email}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Age/Weight/Height:</Text>
          <Text style={styles.summaryValue}>{age} yrs / {weight} kg / {height} cm</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Activity Level:</Text>
          <Text style={styles.summaryValue}>{activityLevel.replace(' ', ' ')}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <StatusBar style="light" />
        
        <LinearGradient
          colors={['#FF6B35', '#FF8C42', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        >
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
          
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Join Us</Text>
              <Text style={styles.subtitle}>Create your profile to get personalized AI coaching</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]}
                />
              </View>
              {renderStepIndicator()}
            </View>

            {/* Form Content */}
            <BlurView intensity={20} tint="light" style={styles.formContainer}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Navigation Buttons */}
              <View style={styles.navigationButtons}>
                {currentStep > 1 && (
                  <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                  </TouchableOpacity>
                )}
                
                {currentStep < 3 ? (
                  <TouchableOpacity 
                    style={[styles.nextButton, currentStep === 1 && styles.fullWidth]}
                    onPress={handleNext}
                  >
                    <LinearGradient
                      colors={['#FF6B35', '#FF8C42']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.buttonText}>Continue</Text>
                      <Text style={styles.buttonArrow}>→</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.nextButton, styles.fullWidth]}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#FF6B35', '#FF8C42']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>Create Account</Text>
                          <Text style={styles.buttonArrow}>🎉</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </BlurView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <LinearGradient
                    colors={['#FF6B35', '#FF8C42']}
                    style={styles.loginGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.linkText}>Log In</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            </View>

            <Text style={styles.versionText}>Secure registration • AI-Powered Fitness</Text>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    position: 'relative',
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle3: {
    position: 'absolute',
    top: '40%',
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    marginTop: Platform.OS === 'ios' ? 20 : 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  stepDotActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  stepDotCompleted: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  stepDotText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 24,
  },
  stepContainer: {
    padding: 24,
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 55,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  hintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#FF6B35',
  },
  selectedCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  summaryValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullWidth: {
    flex: 1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  loginGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 20,
  },
});
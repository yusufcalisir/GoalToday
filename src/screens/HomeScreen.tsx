import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
  Image,
  Alert,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabits } from '../context/HabitContext';
import { HabitItem } from '../components/HabitItem';

import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Calendar, Bell, SlidersHorizontal, Sparkles, CheckCircle, Award, Footprints } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { AnimatedCheckmark } from '../components/AnimatedCheckmark';
import { useStepGarden } from '../hooks/useStepGarden';

const { width } = Dimensions.get('window');

// Removing Animated.createAnimatedComponent(Circle) as it causes issues on web sometimes
// const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { habits, getTodaysHabits, userProfile, colors: appColors, toggleHabitCompletion, dailyTask, isDailyTaskCompleted, completeDailyTask } = useHabits();
  const { steps, isManualMode, addManualSteps, permissionStatus, permissionAlert, retryConnection } = useStepGarden();
  
  const [todaysHabits, setTodaysHabits] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const CATEGORIES = [
      { id: 'all', label: 'Tümü' },
      { id: 'health', label: 'Sağlık' },
      { id: 'learning', label: 'Öğrenme' },
      { id: 'productivity', label: 'Üretkenlik' },
      { id: 'mindfulness', label: 'Farkındalık' },
      { id: 'social', label: 'Sosyal' },
      { id: 'finance', label: 'Finans' },
  ];
  
  // Animation Values
  // Using standard Animated values for layout
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadHabits();
  }, [habits]);

  const loadHabits = () => {
    const today = getTodaysHabits();
    setTodaysHabits(today);
    animateEntry();
  };

  const animateEntry = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Removed direct Animated.timing for progressAnim to avoid native driver issues on web with SVG props

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Trigger habit reload
    loadHabits();
    // Trigger step counter retry
    retryConnection();
    
    setTimeout(() => {
        setRefreshing(false);
    }, 1500);
  }, []);

  // Calculate Progress
  const todayStr = new Date().toISOString().split('T')[0];
  const completedCount = todaysHabits.filter(h => h.completedDates.includes(todayStr)).length;
  const totalCount = todaysHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Greeting
  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Günaydın';
      if (hour < 18) return 'İyi Günler';
      return 'İyi Akşamlar';
  };

  // Ring Configuration
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleToggleHabit = React.useCallback((id: string) => {
    const today = new Date().toISOString().split('T')[0];
    toggleHabitCompletion(id, today);
  }, [toggleHabitCompletion]);

  const filteredHabits = React.useMemo(() => {
    return todaysHabits.filter(h => filterCategory === 'all' || h.category === filterCategory);
  }, [todaysHabits, filterCategory]);

  return (
    <View style={styles.container}>
      <LinearGradient
          colors={appColors.backgroundGradient as string[]}
          style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={appColors.primary} />
        }
        removeClippedSubviews={Platform.OS === 'android'}
      >
        {showConfetti && (
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <ConfettiCannon count={200} origin={{x: width / 2, y: 0}} fallSpeed={2500} fadeOut={true} />
            </View>
        )}
        {/* Header Section */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.headerTop}>
                <View style={styles.greetingWrapper}>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Settings')}
                        activeOpacity={0.8}
                        style={[styles.miniAvatar, { backgroundColor: appColors.card, borderColor: appColors.border }]}
                    >
                        {userProfile?.photoUri ? (
                            <Image source={{ uri: userProfile.photoUri }} style={styles.miniAvatarImage} />
                        ) : (
                            <Text style={styles.miniAvatarText}>{userProfile?.avatar || '👤'}</Text>
                        )}
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.greeting, { color: appColors.subText }]}>{getGreeting()},</Text>
                        <Text style={[styles.username, { color: appColors.text }]}>
                            {userProfile?.name ? (userProfile.name.charAt(0).toUpperCase() + userProfile.name.slice(1)) : 'Misafir'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={[styles.notificationBtn, { backgroundColor: appColors.card }]}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Bell size={22} color={appColors.text} />
                    <View style={styles.badge} />
                </TouchableOpacity>
            </View>
            
            {/* Hero Card with Progress Ring */}
            <View style={[styles.heroCard, { backgroundColor: appColors.primary }]}>
                <LinearGradient
                    colors={appColors.primaryGradient as string[]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.heroContent}>
                    <View style={styles.progressContainer}>
                         <Svg width={size} height={size}>
                            <Circle 
                                stroke="rgba(255,255,255,0.2)" 
                                cx={size / 2} 
                                cy={size / 2} 
                                r={radius} 
                                strokeWidth={strokeWidth} 
                            />
                            <Circle 
                                stroke="white" 
                                cx={size / 2} 
                                cy={size / 2} 
                                r={radius} 
                                strokeWidth={strokeWidth} 
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                rotation="-90"
                                origin={`${size / 2}, ${size / 2}`}
                            />
                        </Svg>
                        <View style={styles.progressTextContainer}>
                            <Text style={styles.progressValue}>{progressPercent}%</Text>
                        </View>
                    </View>
                    
                    <View style={styles.heroStats}>
                        <Text style={styles.heroTitle}>Günlük Skor</Text>
                        <Text style={styles.heroSubtitle}>{completedCount} / {totalCount} Tamamlandı</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.streakBadge}>
                                <Flame size={16} color="#FF9F43" fill="#FF9F43" />
                                <Text style={styles.streakText}>5 Günlük Seri 🔥</Text>
                            </View>

                            <TouchableOpacity 
                                style={[styles.stepBadge, isManualMode && { backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }]}
                                onPress={() => {
                                    if (permissionStatus === 'denied') {
                                        Alert.alert('İzin Gerekli', permissionAlert);
                                    } else if (isManualMode) {
                                        Alert.prompt(
                                            'Manuel Adım Ekle',
                                            'Eklemek istediğin adım sayısını gir:',
                                            [
                                                { text: 'İptal', style: 'cancel' },
                                                { 
                                                    text: 'Ekle', 
                                                    onPress: (val) => {
                                                        const num = parseInt(val || '0', 10);
                                                        if (!isNaN(num) && num > 0) {
                                                            addManualSteps(num);
                                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                                        }
                                                    }
                                                }
                                            ],
                                            'plain-text',
                                            '',
                                            'numeric'
                                        );
                                    } else {
                                        Alert.alert('Adım Sayar Aktif', `Şu an ${Platform.OS === 'ios' ? 'Apple Health / Motion' : 'Cihaz Sensörü'} üzerinden adım takibi yapılıyor.`);
                                    }
                                }}
                            >
                                <Footprints size={14} color="white" fill={isManualMode ? "rgba(255,255,255,0.5)" : "white"} />
                                <Text style={styles.stepCountText}>{steps}</Text>
                                <Text style={styles.stepLabelText}>{isManualMode ? '(Manuel)' : 'Adım'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Animated.View>

        {/* Habits Section */}
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: appColors.text }]}>
                    {habits.length > 1 ? 'Hedeflerim' : 'Hedefim'}
                </Text>
                <TouchableOpacity 
                    style={[styles.filterBtn, { borderColor: appColors.border, backgroundColor: isFilterVisible ? appColors.primary + '10' : 'transparent' }]}
                    onPress={() => setIsFilterVisible(!isFilterVisible)}
                >
                    <SlidersHorizontal size={16} color={isFilterVisible ? appColors.primary : appColors.subText} />
                    <Text style={[styles.filterText, { color: isFilterVisible ? appColors.primary : appColors.subText }]}>Filtrele</Text>
                </TouchableOpacity>
            </View>
            
            {isFilterVisible && (
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.filterChip,
                                    filterCategory === cat.id ? { backgroundColor: appColors.primary } : { backgroundColor: appColors.card, borderColor: appColors.border, borderWidth: 1 }
                                ]}
                                onPress={() => setFilterCategory(cat.id)}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    filterCategory === cat.id ? { color: 'white' } : { color: appColors.subText }
                                ]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            
            {todaysHabits.length > 0 ? (
                filteredHabits.length > 0 ? (
                    filteredHabits.map((habit) => (
                        <HabitItem 
                            key={habit.id} 
                            habit={habit} 
                            isCompleted={habit.completedDates.includes(todayStr)}
                            onToggle={() => handleToggleHabit(habit.id)} 
                        />
                    ))
                ) : (
                    <Text style={{ textAlign: 'center', color: appColors.subText, marginVertical: 20 }}>Bu kategoride hedefiniz yok.</Text>
                )
            ) : (
                <View style={[styles.emptyState, { backgroundColor: appColors.card }]}>
                    <Calendar size={40} color={appColors.subText} />
                    <Text style={[styles.emptyText, { color: appColors.subText }]}>
                        Bugün için henüz bir planın yok.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.startBtn, { backgroundColor: appColors.primary }]}
                        onPress={() => navigation.navigate('AddHabit')}
                    >
                        <Text style={styles.startBtnText}>Yeni Ekle</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Animated.View>



        {/* Daily Task Widget - Only show if less than 3 goals */}
        {habits.length < 3 && (
            <Animated.View style={[styles.widgetContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <View style={[styles.dailyTaskCard, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
                    <View style={styles.dailyTaskHeader}>
                        <View style={[styles.dailyTaskIcon, { backgroundColor: appColors.primary + '15' }]}>
                            <Sparkles size={16} color={appColors.primary} fill={appColors.primary + '20'} />
                        </View>
                        <Text style={[styles.dailyTaskLabel, { color: appColors.primary }]}>GÜNÜN GÖREVİ</Text>
                        {isDailyTaskCompleted && (
                            <View style={[styles.completedBadge, { backgroundColor: appColors.success + '20' }]}>
                                <Text style={[styles.completedText, { color: appColors.success }]}>Tamamlandı</Text>
                            </View>
                        )}
                    </View>
                    
                    <Text style={[styles.dailyTaskText, { color: appColors.text }]}>{dailyTask || "Günlük görevin hazırlanıyor..."}</Text>
                    
                    {!isDailyTaskCompleted ? (
                        <TouchableOpacity 
                            style={[styles.completeBtn, { backgroundColor: appColors.primary }]}
                            onPress={() => {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                completeDailyTask();
                                setShowConfetti(true);
                                setTimeout(() => setShowConfetti(false), 3000);
                            }}
                        >
                            <CheckCircle size={16} color="white" />
                            <Text style={styles.completeBtnText}>Görevi Tamamla (+10 Puan)</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.rewardInfo}>
                            <AnimatedCheckmark size={24} color={appColors.success} />
                            <Text style={[styles.rewardText, { color: appColors.subText }]}>Tebrikler! 10 puan kazandın.</Text>
                        </View>
                    )}
                </View>
            </Animated.View>
        )}
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greetingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  miniAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  miniAvatarText: {
    fontSize: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
  },
  notificationBtn: {
    padding: 10,
    borderRadius: 14,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  badge: {
     position: 'absolute',
     top: 10,
     right: 10,
     width: 8,
     height: 8,
     borderRadius: 4,
     backgroundColor: '#FF5252',
     borderWidth: 1,
     borderColor: 'white',
  },
  heroCard: {
    borderRadius: 30,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#4A00E0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
  },
  progressContainer: {
      width: 120,
      height: 120,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
  },
  progressTextContainer: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
  },
  progressValue: {
      color: 'white',
      fontWeight: '800',
      fontSize: 28,
  },
  heroStats: {
      flex: 1,
      justifyContent: 'center',
  },
  heroTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      opacity: 0.9,
      marginBottom: 4,
  },
  heroSubtitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 16,
  },
  streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
      gap: 6,
  },
  streakText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 12,
  },
  widgetContainer: {
      marginBottom: 20,
  },
  dailyTaskCard: {
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
  },
  dailyTaskHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
  },
  dailyTaskIcon: {
      width: 28,
      height: 28,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
  },
  dailyTaskLabel: {
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.2,
      opacity: 0.7,
  },
  dailyTaskText: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 16,
      lineHeight: 20,
  },
  completeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      gap: 8,
  },
  completeBtnText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 14,
  },
  completedBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      marginLeft: 'auto',
  },
  completedText: {
      fontSize: 10,
      fontWeight: '800',
  },
  rewardInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  rewardText: {
      fontSize: 13,
      fontWeight: '600',
  },
  sectionContainer: {
      marginBottom: 20,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
  },
  filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      gap: 6,
  },
  filterText: {
      fontSize: 12,
      fontWeight: '600',
  },
  emptyState: {
      padding: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 20,
      fontWeight: '500',
  },
  startBtn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
  },
  startBtnText: {
      color: 'white',
      fontWeight: 'bold',
  },
  filterScroll: {
      paddingVertical: 10,
      gap: 10,
  },
  filterContainer: {
      marginBottom: 15,
  },
  filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
  },
  filterChipText: {
      fontSize: 13,
      fontWeight: '600',
  },
  stepBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 6,
  },
  stepCountText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '800',
  },
  stepLabelText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 10,
      fontWeight: '600',
  },
  statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
      flexWrap: 'wrap',
  }
});



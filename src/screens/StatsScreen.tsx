import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabits } from '../context/HabitContext';
import { TrendingUp, Award, CheckCircle, Calendar, Star, Zap, Target, BarChart2, Sparkles, Flame, Medal, Crown, Trophy, GraduationCap as GraduationCapIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Circle, G, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

const getShortDayName = (date: Date) => {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return days[date.getDay()];
};

export const StatsScreen = () => {
  const { habits, userProfile, colors: appColors } = useHabits();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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
  }, []);

  const totalCompletions = habits.reduce((acc, habit) => acc + habit.completedDates.length, 0);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const totalPoints = userProfile?.points || 0;

  // Weekly Data Calculation
  const weeklyData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = getShortDayName(d);
      
      const count = habits.reduce((acc, h) => h.completedDates.includes(dateStr) ? acc + 1 : acc, 0);
      data.push({ day: dayName, count });
    }
    return data;
  }, [habits]);

  const maxDaily = Math.max(...weeklyData.map(d => d.count), 1);
  const chartHeight = 150;
  const barWidth = 24; // Reduced from 30 to prevent overlap
  const spacing = (width - 80 - (barWidth * 7)) / 6;


  

  
  // Category Calculations
  const categoryCounts = useMemo(() => {
    const counts: {[key: string]: number} = {};
    habits.forEach(habit => {
        if (!counts[habit.category]) counts[habit.category] = 0;
        counts[habit.category] += habit.completedDates.length;
    });
    return counts;
  }, [habits]);
  const productiveHoursData = useMemo(() => {
    const hours = new Array(24).fill(0);
    habits.forEach(habit => {
      habit.logs?.forEach(log => {
        const date = new Date(log);
        const hour = date.getHours();
        hours[hour]++;
      });
    });
    
    // Group into 4-hour blocks for cleaner chart: 0-4, 4-8, 8-12, 12-16, 16-20, 20-24
    const blocks = [
        { label: '00-04', count: 0 },
        { label: '04-08', count: 0 },
        { label: '08-12', count: 0 },
        { label: '12-16', count: 0 },
        { label: '16-20', count: 0 },
        { label: '20-24', count: 0 },
    ];

    hours.forEach((count, h) => {
        const blockIndex = Math.floor(h / 4);
        if (blocks[blockIndex]) {
            blocks[blockIndex].count += count;
        }
    });

    return blocks;
  }, [habits]);

  const maxProductive = Math.max(...productiveHoursData.map(d => d.count), 1);

  // Top Streaks Logic
  const topStreaks = useMemo(() => {
    return [...habits]
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 3)
        .filter(h => h.streak > 0);
  }, [habits]);

  // Badges Logic
  const badges = [
    // 1. Milestones
    { id: 1, title: 'İlk Adım', desc: 'İlk hedefini tamamla!', icon: Star, color: '#FFD700', earned: totalCompletions > 0 },

    // 2. Streaks
    { id: 2, title: 'Alev Aldın', desc: '3 gün seri yap', icon: Zap, color: '#FF6F61', earned: bestStreak >= 3 },
    { id: 4, title: 'İstikrar', desc: '7 gün seri', icon: Target, color: '#2ECC71', earned: bestStreak >= 7 },
    { id: 5, title: 'İstikrar Abidesi', desc: '30 gün seri', icon: Flame, color: '#FF4500', earned: bestStreak >= 30 },
    { id: 8, title: 'Yıllık Çınar', desc: '1 yıl seri', icon: Trophy, color: '#34495E', earned: bestStreak >= 365 },

    // 3. Points
    { id: 3, title: 'Şampiyon', desc: '1000 puana ulaş', icon: Award, color: appColors.primary, earned: totalPoints >= 1000 },
    { id: 6, title: 'Usta', desc: '5000 puan', icon: Medal, color: '#9B59B6', earned: totalPoints >= 5000 },
    { id: 7, title: 'Efsane', desc: '10000 puan', icon: Crown, color: '#E74C3C', earned: totalPoints >= 10000 },

    // 4. Categories
    { id: 9, title: 'Demir Vücut', desc: '10 Sağlık görevi', icon: Zap, color: '#e74c3c', earned: (categoryCounts['health'] || 0) >= 10 },
    { id: 10, title: 'Bilge', desc: '10 Öğrenme görevi', icon: GraduationCapIcon, color: '#3498db', earned: (categoryCounts['learning'] || 0) >= 10 },
    { id: 11, title: 'Zen Ustası', desc: '10 Farkındalık', icon: Sparkles, color: '#9b59b6', earned: (categoryCounts['mindfulness'] || 0) >= 10 },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
          colors={appColors.backgroundGradient as string[]}
          style={StyleSheet.absoluteFillObject}
      />

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: appColors.text }]}>İstatistikler</Text>
                <Text style={[styles.headerSubtitle, { color: appColors.subText }]}>Gelişimini takip et ve motive ol.</Text>
            </View>

            {/* Score Grid */}
            <View style={styles.grid}>
                <View style={[styles.card, { backgroundColor: appColors.card }]}>
                     <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                        <Star size={24} color="#FFD700" fill="#FFD700" />
                     </View>
                     <Text style={[styles.cardValue, { color: appColors.text }]}>{totalPoints}</Text>
                     <Text style={[styles.cardLabel, { color: appColors.subText }]}>Toplam Puan</Text>
                </View>
                <View style={[styles.card, { backgroundColor: appColors.card }]}>
                     <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 111, 97, 0.1)' }]}>
                        <FlameIcon size={24} color="#FF6F61" fill="#FF6F61" />
                     </View>
                     <Text style={[styles.cardValue, { color: appColors.text }]}>{bestStreak}</Text>
                     <Text style={[styles.cardLabel, { color: appColors.subText }]}>En İyi Seri</Text>
                </View>
            </View>

            <View style={[styles.grid, { marginTop: 15 }]}>
                <View style={[styles.card, { backgroundColor: appColors.card }]}>
                     <View style={[styles.iconBox, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                        <CheckCircle size={24} color="#2ECC71" />
                     </View>
                     <Text style={[styles.cardValue, { color: appColors.text }]}>{totalCompletions}</Text>
                     <Text style={[styles.cardLabel, { color: appColors.subText }]}>Tamamlanan Hedef</Text>
                </View>
                <View style={[styles.card, { backgroundColor: appColors.card }]}>
                     <View style={[styles.iconBox, { backgroundColor: 'rgba(155, 89, 182, 0.1)' }]}>
                        <Sparkles size={24} color="#9B59B6" fill="#9B59B620" />
                     </View>
                     <Text style={[styles.cardValue, { color: appColors.text }]}>{userProfile?.completedDailyTasksCount || 0}</Text>
                     <Text style={[styles.cardLabel, { color: appColors.subText }]}>Tamamlanan Görevler</Text>
                </View>
            </View>

            {/* Top Streaks - New Section */}
            {topStreaks.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: appColors.text }]}>Seri Liderleri 🔥</Text>
                    {topStreaks.map((habit, index) => (
                        <View key={habit.id} style={[styles.streakCardRow, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
                            <View style={styles.streakRank}>
                                <Text style={[styles.rankText, { color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }]}>
                                    #{index + 1}
                                </Text>
                            </View>
                            <View style={styles.streakInfo}>
                                <Text style={[styles.streakTitle, { color: appColors.text }]}>{habit.title}</Text>
                                <Text style={[styles.streakSubtitle, { color: appColors.subText }]}>{habit.streak} Günlük Seri</Text>
                            </View>
                            <Flame size={20} color="#FF6F61" fill={index === 0 ? "#FF6F61" : "transparent"} />
                        </View>
                    ))}
                </View>
            )}

            {/* Productive Hours Chart - New Section */}
             <View style={[styles.chartCard, { backgroundColor: appColors.card, marginTop: 25 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 }}>
                    <View style={[styles.iconBox, { width: 32, height: 32, backgroundColor: appColors.primary + '15', borderRadius: 8 }]}>
                        <Sparkles size={16} color={appColors.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: appColors.text, marginBottom: 0 }]}>En Verimli Saatler</Text>
                </View>
                
                <View style={styles.chartWrapper}>
                    <Svg height={120} width="100%">
                        {productiveHoursData.map((item, index) => {
                            const barHeight = (item.count / maxProductive) * 90;
                            const totalWidth = width - 88; // Padding correction
                            const itemWidth = totalWidth / 6;
                            const barW = 20;
                            const x = index * itemWidth + (itemWidth - barW) / 2;
                            
                            return (
                                <G key={index}>
                                    <Rect
                                        x={x}
                                        y={100 - barHeight}
                                        width={barW}
                                        height={barHeight}
                                        rx={4}
                                        fill={item.count > 0 ? appColors.secondary || appColors.primary : '#E0E0E0'}
                                        opacity={item.count > 0 ? 0.8 : 0.3}
                                    />
                                    <SvgText
                                        x={x + barW / 2}
                                        y={115}
                                        fontSize="9"
                                        fill={appColors.subText}
                                        textAnchor="middle"
                                        fontWeight="600"
                                    >
                                        {item.label}
                                    </SvgText>
                                </G>
                            );
                        })}
                    </Svg>
                </View>
            </View>

            {/* Weekly Chart */}
            <View style={[styles.chartCard, { backgroundColor: appColors.card }]}>
                <Text style={[styles.sectionTitle, { color: appColors.text }]}>Haftalık Aktivite</Text>
                <View style={styles.chartWrapper}>
                    <Svg height={chartHeight} width="100%">
                        {weeklyData.map((item, index) => {
                            const barHeight = (item.count / maxDaily) * (chartHeight - 30);
                            const x = index * (barWidth + spacing);
                            return (
                                <G key={index}>
                                    <Rect
                                        x={x}
                                        y={chartHeight - 20 - barHeight}
                                        width={barWidth}
                                        height={barHeight}
                                        rx={6}
                                        fill={item.count > 0 ? appColors.primary : '#E0E0E0'}
                                    />
                                    <SvgText
                                        x={x + barWidth / 2}
                                        y={chartHeight}
                                        fontSize="10"
                                        fill={appColors.subText}
                                        textAnchor="middle"
                                    >
                                        {item.day}
                                    </SvgText>
                                </G>
                            );
                        })}
                    </Svg>
                </View>
            </View>

            {/* Badges */}
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: appColors.text }]}>Rozetlerin</Text>
                <View style={styles.badgesGrid}>
                    {badges.map((badge) => (
                        <View 
                            key={badge.id} 
                            style={[
                                styles.badgeCard, 
                                { 
                                    backgroundColor: appColors.card,
                                    borderColor: badge.earned ? badge.color : appColors.border,
                                    opacity: badge.earned ? 1 : 0.6
                                }
                            ]}
                        >
                            <View style={[styles.badgeIcon, { backgroundColor: badge.earned ? badge.color + '20' : appColors.inputBg }]}>
                                <badge.icon size={24} color={badge.earned ? badge.color : appColors.subText} />
                            </View>
                            <Text style={[styles.badgeTitle, { color: appColors.text }]}>{badge.title}</Text>
                            <Text style={[styles.badgeDesc, { color: appColors.subText }]}>{badge.desc}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};



// Helper for Flame Icon since lucide-react-native might vary
const FlameIcon = ({ size, color, fill }: any) => (
    <View>
        <Zap size={size} color={color} fill={fill} />
    </View>
);



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    gap: 15,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  longCard: {
      flex: 1,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
  },
  longCardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  iconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
  },
  cardValue: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 4,
  },
  cardLabel: {
      fontSize: 12,
      fontWeight: '600',
  },
  chartCard: {
      marginTop: 25,
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 20,
  },
  chartWrapper: {
      alignItems: 'center',
  },
  sectionContainer: {
      marginTop: 25,
  },
  badgesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
  },
  badgeCard: {
      width: (width - 55) / 2,
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      marginBottom: 15,
  },
  badgeIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
  },
  badgeTitle: {
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 4,
  },
  badgeDesc: {
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 14,
  },
  streakCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      marginBottom: 10,
      borderWidth: 1,
  },
  streakRank: {
      width: 30,
      alignItems: 'center',
      marginRight: 10,
  },
  rankText: {
      fontSize: 18,
      fontWeight: '900',
  },
  streakInfo: {
      flex: 1,
  },
  streakTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 2,
  },
  streakSubtitle: {
      fontSize: 12,
  }
});

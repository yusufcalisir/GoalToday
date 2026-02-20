import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabits } from '../context/HabitContext';
import { colors } from '../constants/colors';
import { RootStackParamList } from '../types/habit';
import { CATEGORY_OPTIONS } from '../types/user';
import { ArrowLeft, Calendar, Check, Flame, Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Simple helper to get days in current month
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};
// Force update

import ConfettiCannon from 'react-native-confetti-cannon';

export const HabitDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'HabitDetail'>>();
  const { habitId } = route.params;
  const { habits, toggleHabitCompletion, deleteHabit, colors: appColors } = useHabits();
  const confettiRef = React.useRef<any>(null);

  const habit = habits.find(h => h.id === habitId);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const category = CATEGORY_OPTIONS.find(c => c.id === habit?.category) || CATEGORY_OPTIONS[0];
  // @ts-ignore
  const categoryColor = habit ? (appColors.categories[habit.category] || appColors.primary) : appColors.primary;

  const isCompletedToday = habit?.completedDates.includes(todayStr);

  const handleToggle = () => {
      if (!isCompletedToday) {
          confettiRef.current?.start();
      }
      toggleHabitCompletion(habitId, todayStr);
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
        const confirmed = window.confirm("Bu hedefi silmek istediğine emin misin?");
        if (confirmed) {
            deleteHabit(habitId);
            navigation.goBack();
        }
    } else {
        Alert.alert(
          "Hedefi Sil",
          "Bu hedefi silmek istediğine emin misin?",
          [
            { text: "Vazgeç", style: "cancel" },
            { 
              text: "Sil", 
              style: "destructive", 
              onPress: () => {
                deleteHabit(habitId);
                navigation.goBack();
              }
            }
          ]
        );
    }
  };

  const renderCalendar = () => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <View style={[styles.calendarContainer, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
        <View style={styles.calendarHeader}>
          <Calendar size={18} color={categoryColor} />
          <Text style={[styles.calendarTitle, { color: appColors.text }]}>
            {today.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.calendarGrid}>
          {days.map(day => {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isCompleted = habit?.completedDates.includes(dateStr);
            const isToday = dateStr === todayStr;

            return (
              <View 
                key={day} 
                style={[
                  styles.dayCell,
                  { backgroundColor: appColors.inputBg },
                  isCompleted && { backgroundColor: categoryColor },
                  isToday && !isCompleted && { borderColor: categoryColor, borderWidth: 2 }
                ]}
              >
                <Text style={[
                  styles.dayText,
                  { color: appColors.subText },
                  isCompleted && { color: 'white', fontWeight: '800' },
                  isToday && !isCompleted && { color: categoryColor, fontWeight: '800' }
                ]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (!habit) return null;

  return (
    <View style={{ flex: 1 }}>
        <LinearGradient
            colors={appColors.backgroundGradient as string[]}
            style={StyleSheet.absoluteFillObject}
        />
        
        <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: appColors.card }]}>
                <ArrowLeft size={22} color={appColors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: appColors.text }]}>Hedef Detayı</Text>
            <View style={{ width: 44 }} />
        </View>

        {/* Main Card */}
        <View style={[styles.mainCard, { borderColor: categoryColor + '30', backgroundColor: appColors.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: categoryColor + '15' }]}>
                <Text style={{ fontSize: 44 }}>{category.icon}</Text>
            </View>
            <Text style={[styles.habitTitle, { color: appColors.text }]}>{habit.title}</Text>
            
            <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: categoryColor + '15' }]}>
                    <Text style={[styles.badgeText, { color: categoryColor }]}>{category.label}</Text>
                </View>
                {habit.streak > 0 && (
                    <View style={[styles.badge, { backgroundColor: appColors.orange + '15' }]}>
                        <Flame size={14} color={appColors.orange} fill={appColors.orange} />
                        <Text style={[styles.badgeText, { color: appColors.orange, marginLeft: 4 }]}>
                            {habit.streak} Gün
                        </Text>
                    </View>
                )}
            </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
            style={[
                styles.actionButton,
                { backgroundColor: isCompletedToday ? appColors.success : categoryColor, shadowColor: isCompletedToday ? appColors.success : categoryColor }
            ]}
            onPress={handleToggle}
            activeOpacity={0.8}
        >
            <View style={styles.actionIconBox}>
                {isCompletedToday ? <Check size={22} color="white" strokeWidth={3} /> : <Trophy size={22} color="white" />}
            </View>
            <Text style={styles.actionButtonText}>
                {isCompletedToday ? 'Bugünü Tamamladın!' : 'Bugün Tamamla'}
            </Text>
        </TouchableOpacity>

        {/* Calendar Section */}
        {renderCalendar()}

        {/* Recommendation */}
        <View style={[styles.recommendationCard, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
            <Text style={[styles.sectionTitle, { color: categoryColor }]}>💡 Gelişim İpucu</Text>
            <Text style={[styles.recommendationText, { color: appColors.text }]}>
                İstikrarı korumak için günün aynı saatlerinde hatırlatıcı kurmayı dene. Her küçük adım büyük başarıya götürür!
            </Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={[styles.deleteButtonText, { color: appColors.error }]}>Hedefi Takibi Bırak</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
        </ScrollView>
        <ConfettiCannon
            count={200}
            origin={{x: -10, y: 0}}
            autoStart={false}
            ref={confettiRef}
            fadeOut={true}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  mainCard: {
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  habitTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 22,
    marginBottom: 25,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    gap: 15,
  },
  actionIconBox: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  calendarContainer: {
    borderRadius: 26,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recommendationCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    opacity: 0.8,
  },
  deleteButton: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  deleteButtonText: {
    fontWeight: '700',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});

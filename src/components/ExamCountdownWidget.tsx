import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useCountdown } from '../hooks/useCountdown';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, AlertCircle, Trash2, GraduationCap, Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ExamCountdownWidgetProps {
  exam: {
    id: string;
    title: string;
    date: string;
    color?: string;
    goal?: string;
  };
  appColors: any;
  onDelete: () => void;
  onEditGoal: () => void;
}

export const ExamCountdownWidget = React.memo(({ exam, appColors, onDelete, onEditGoal }: ExamCountdownWidgetProps) => {
  const timeLeft = useCountdown(exam.date);
  const { days, hours, minutes, seconds, isExpired } = timeLeft;

  const examColor = exam.color || appColors.primary;

  // Calculate progress circle
  const totalDays = 365; // Assume 1 year max for circle progress for now
  const daysLeft = days;
  const progress = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.max(10, 100 - progress) / 100) * circumference;
  const getMotivation = () => {
    if (isExpired) return `${exam.title} tamamlandı. Geçmiş olsun!`;
    if (days === 0 && hours < 24) return `BUGÜN! ${exam.title} günü. Başarılar! 🍀`;
    if (days === 1) return `YARIN! Son tekrarlar ve dinlenme vakti.`;
    if (days <= 7) return `Son hafta! Stratejini belirle.`;
    if (days <= 30) return `Son 1 ay! Temponu koru.`;
    return `${exam.title} için önünde uzun bir yol var.`;
  };
  return (
    <View style={[styles.container, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={[styles.badge, { backgroundColor: isExpired ? appColors.subText : examColor }]}>
                    <Clock size={12} color="white" />
                    <Text style={styles.badgeText}>
                        {isExpired ? 'SONLANDI' : days === 0 ? 'BUGÜN' : 'GERİ SAYIM'}
                    </Text>
                </View>
                <Text style={[styles.title, { color: appColors.text }]}>{exam.title}</Text>
            </View>
            <TouchableOpacity 
                style={[styles.deleteBtn, { backgroundColor: appColors.error + '10' }]}
                onPress={onDelete}
                testID="delete-button"
            >
                <Trash2 size={16} color={appColors.error} />
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
            <View style={styles.chartContainer}>
                <Svg width={140} height={140} style={styles.svg}>
                    <Circle cx="70" cy="70" r={radius} stroke={appColors.border + '40'} strokeWidth={strokeWidth} fill="transparent" />
                    <Circle
                        cx="70" cy="70" r={radius} stroke={isExpired ? appColors.subText : examColor} strokeWidth={strokeWidth} fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform="rotate(-90 70 70)"
                    />
                </Svg>
                <View style={styles.chartTextContainer}>
                    <Text style={[styles.daysLeft, { color: appColors.text }]}>{isExpired ? '-' : days}</Text>
                    <Text style={[styles.daysLabel, { color: appColors.subText }]}>GÜN</Text>
                </View>
            </View>

            <View style={styles.timerGrid}>
                <View style={[styles.timerBox, { backgroundColor: appColors.background }]}>
                    <Text style={[styles.timerValue, { color: appColors.text }]}>{hours.toString().padStart(2, '0')}</Text>
                    <Text style={[styles.timerLabel, { color: appColors.subText }]}>SAAT</Text>
                </View>
                <View style={[styles.timerBox, { backgroundColor: appColors.background }]}>
                    <Text style={[styles.timerValue, { color: appColors.text }]}>{minutes.toString().padStart(2, '0')}</Text>
                    <Text style={[styles.timerLabel, { color: appColors.subText }]}>DAKİKA</Text>
                </View>
                <View style={[styles.timerBox, { backgroundColor: appColors.background }]}>
                    <Text style={[styles.timerValue, { color: examColor }]}>{seconds.toString().padStart(2, '0')}</Text>
                    <Text style={[styles.timerLabel, { color: appColors.subText }]}>SANİYE</Text>
                </View>
            </View>
        </View>

        <View style={[styles.motivationBox, { backgroundColor: examColor + '10', borderColor: examColor + '30' }]}>
            <AlertCircle size={16} color={examColor} />
            <Text style={[styles.motivationText, { color: examColor }]}>{getMotivation()}</Text>
        </View>

        <TouchableOpacity 
            style={[styles.goalContainer, { backgroundColor: appColors.background, borderColor: appColors.border }]}
            onPress={onEditGoal}
            activeOpacity={0.7}
        >
             <View style={styles.goalHeader}>
                 <GraduationCap size={16} color={appColors.primary} />
                 <Text style={[styles.goalLabel, { color: appColors.subText }]}>HEDEFİM</Text>
             </View>
             <View style={styles.goalContent}>
                 {exam.goal ? (
                     <Text style={[styles.goalText, { color: appColors.text }]} numberOfLines={1}>{exam.goal}</Text>
                 ) : (
                     <Text style={[styles.goalPlaceholder, { color: appColors.subText }]}>Bir hedef belirle...</Text>
                 )}
                 <Plus size={14} color={appColors.primary} />
             </View>
        </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: { // New style
      gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start', // Important for layout
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  deleteBtn: { // New style
      padding: 8,
      borderRadius: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  chartTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysLeft: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
  },
  daysLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  timerGrid: {
    gap: 10,
  },
  timerBox: {
    width: 80,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  timerValue: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  motivationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginBottom: 15,
  },
  motivationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  goalContainer: { // New styles
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
  },
  goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
  },
  goalLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
  },
  goalContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  goalText: {
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
  },
  goalPlaceholder: {
      fontSize: 14,
      fontStyle: 'italic',
      flex: 1,
  }
});

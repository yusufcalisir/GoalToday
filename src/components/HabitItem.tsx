import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Habit } from '../types/habit';
import { Check, Flame } from 'lucide-react-native';
import { CATEGORY_OPTIONS } from '../types/user';
import { useHabits } from '../context/HabitContext';
import * as Haptics from 'expo-haptics';
import { AnimatedCheckmark } from './AnimatedCheckmark';

interface HabitItemProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
}

export const HabitItem = React.memo(({ habit, isCompleted, onToggle }: HabitItemProps) => {
  const navigation = useNavigation<any>();
  const { colors: appColors } = useHabits();

  const category = React.useMemo(() => 
    CATEGORY_OPTIONS.find(c => c.id === habit.category) || CATEGORY_OPTIONS[0],
    [habit.category]
  );
  
  const categoryColor = habit.color || (appColors.categories as any)[habit.category] || appColors.primary;
  
  const progressAnim = React.useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: isCompleted ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // width cannot use native driver
    }).start();
  }, [isCompleted]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handlePress = React.useCallback(() => {
    navigation.navigate('HabitDetail', { habitId: habit.id });
  }, [navigation, habit.id]);

  const handleToggle = React.useCallback(() => {
    if (!isCompleted) {
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
       Haptics.selectionAsync();
    }
    onToggle();
  }, [isCompleted, onToggle]);

  return (
    <View 
      style={[
        styles.container, 
        { 
            backgroundColor: appColors.card,
            borderColor: appColors.border,
            shadowColor: isCompleted ? categoryColor : '#000',
        }
      ]}
    >
      <View style={styles.contentRow}>
        <TouchableOpacity 
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: categoryColor + '10' }]}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
    
            <View style={styles.infoContainer}>
            <Text 
                numberOfLines={1}
                style={[
                    styles.title, 
                    { color: appColors.text }, 
                    isCompleted && { color: appColors.subText, textDecorationLine: 'line-through', opacity: 0.6 }
                ]}
            >
                {habit.title}
            </Text>
            <View style={styles.detailsRow}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '15' }]}>
                <Text style={[styles.categoryLabel, { color: categoryColor }]}>{category.label}</Text>
                </View>
                {habit.streak > 0 && (
                    <View style={[styles.streakContainer, { backgroundColor: appColors.orange + '10' }]}>
                    <Flame size={12} color={appColors.orange} fill={appColors.orange} />
                    <Text style={[styles.streakText, { color: appColors.orange }]}>{habit.streak}</Text>
                    </View>
                )}
            </View>
            </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          testID="habit-toggle"
          onPress={handleToggle}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[
            styles.checkCircle, 
            { borderColor: isCompleted ? appColors.success : appColors.border },
            isCompleted && { backgroundColor: appColors.success }
          ]}
        >
          {isCompleted && <AnimatedCheckmark size={18} color="white" />}
        </TouchableOpacity>
      </View>

      {/* Modern Progress Line at the very bottom */}
      <View style={[styles.progressTrack, { backgroundColor: appColors.border + '30' }]}>
        <Animated.View 
          style={[
            styles.progressFill, 
            { 
              width: progressWidth, 
              backgroundColor: isCompleted ? appColors.success : categoryColor 
            }
          ]} 
          testID="habit-progress-bar"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden', 
    borderWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryIcon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 10,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '800',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  progressTrack: {
    height: 4,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  progressFill: {
    height: '100%',
  },
});

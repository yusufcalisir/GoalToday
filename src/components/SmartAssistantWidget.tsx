import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useHabits } from '../context/HabitContext';
import { analyzeHabits, Insight } from '../utils/analysis';
import { AlertCircle, Calendar, Clock, Moon, Flame, Sparkles, X } from 'lucide-react-native';

const ICON_MAP: any = {
    AlertCircle,
    Calendar,
    Clock,
    Moon,
    Flame,
    Sparkles
};

export const SmartAssistantWidget = () => {
  const { habits, exams, colors: appColors } = useHabits();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const insights = analyzeHabits(habits, exams);
    if (insights.length > 0) {
        setInsight(insights[0]); // Show top priority
        setVisible(true);
    }
  }, [habits, exams]);

  if (!insight || !visible) return null;

  const IconComponent = ICON_MAP[insight.icon] || Sparkles;

  return (
    <View style={[styles.container, { backgroundColor: appColors.card, borderLeftColor: insight.color }]}>
        <View style={styles.content}>
            <View style={[styles.iconBox, { backgroundColor: insight.color + '20' }]}>
                <IconComponent size={20} color={insight.color} />
            </View>
            <View style={{ flex: 1 }}>
                 <Text style={[styles.title, { color: insight.color }]}>Asistanın Önerisi</Text>
                 <Text style={[styles.message, { color: appColors.text }]}>{insight.message}</Text>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn} testID="close-button">
                <X size={14} color={appColors.subText} />
            </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
  },
  iconBox: {
      width: 36,
      height: 36,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
  },
  title: {
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },
  message: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
  },
  closeBtn: {
      padding: 4,
  }
});

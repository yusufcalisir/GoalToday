
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, PlusCircle, BarChart2, Settings, GraduationCap } from 'lucide-react-native';
import { useHabits } from '../../context/HabitContext';

const { width } = Dimensions.get('window');

const TabIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
    const scaleAnim = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: focused ? 1.2 : 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true
        }).start();
    }, [focused]);

    let Icon: any = Home;
    if (name === 'Home') Icon = Home;
    else if (name === 'AddHabit') Icon = PlusCircle;
    else if (name === 'Stats') Icon = BarChart2;
    else if (name === 'Exams') Icon = GraduationCap;
    else if (name === 'Settings') Icon = Settings;

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Icon 
                color={color} 
                size={name === 'AddHabit' ? 32 : 24} 
                strokeWidth={focused ? 2.5 : 2}
                fill={focused && name !== 'AddHabit' ? color + '20' : 'none'} 
            />
        </Animated.View>
    );
};

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useHabits();
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      <View style={[styles.tabBar, { backgroundColor: colors.card, shadowColor: colors.primary }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const color = isFocused ? colors.primary : colors.subText;

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <TabIcon name={route.name} focused={isFocused} color={color} />
              {isFocused && (
                   <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    height: 70,
    borderRadius: 35,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      position: 'absolute',
      bottom: 12,
  }
});

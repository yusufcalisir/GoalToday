import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HomeScreen } from '../screens/HomeScreen';
import { AddHabitScreen } from '../screens/AddHabitScreen';
import { StatsScreen } from '../screens/StatsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { RegistrationScreen } from '../screens/RegistrationScreen';
import OnboardingGoalsScreen from '../screens/OnboardingGoalsScreen';
import { HabitDetailScreen } from '../screens/HabitDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LazyScreen } from '../components/LazyScreen';

const LazyStatsScreen = LazyScreen(StatsScreen);
const LazySettingsScreen = LazyScreen(SettingsScreen);
const LazyExamsScreen = LazyScreen(ExamsScreen);
import { colors } from '../constants/colors';
import { useHabits } from '../context/HabitContext';
import { ExamsScreen } from '../screens/ExamsScreen';
import { AddExamScreen } from '../screens/AddExamScreen';
import { Home, PlusCircle, BarChart2, Settings, GraduationCap } from 'lucide-react-native';
import { STORAGE_KEYS } from '../constants/keys';
import { CustomTabBar } from '../components/navigation/CustomTabBar';
import { DebugScreen } from '../screens/DebugScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    const { colors: appColors, userProfile } = useHabits();
    
    return (
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none', // Hide default tab bar
          },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Bugün' }} />
        <Tab.Screen name="AddHabit" component={AddHabitScreen} options={{ title: 'Yeni' }} />
        <Tab.Screen name="Stats" component={LazyStatsScreen} options={{ title: 'İstatistik' }} />
        
        {userProfile?.isStudent && (
             <Tab.Screen name="Exams" component={LazyExamsScreen} options={{ title: 'Sınavlar' }} />
        )}

        <Tab.Screen name="Settings" component={LazySettingsScreen} options={{ title: 'Ayarlar' }} />
      </Tab.Navigator>
    );
};

export const RootNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const userSettings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (userSettings) {
        // User exists, check if profile is complete (JSON object)
        try {
            const parsed = JSON.parse(userSettings);
            if (typeof parsed === 'object' && parsed.isOnboarded) {
                setInitialRoute('Main');
                return;
            }
        } catch {
            // Legacy data or invalid, treat as completed for now to avoid blocking, or reset
             setInitialRoute('Main');
             return;
        }
      }
      // No settings found
      setInitialRoute('Welcome');
      
    } catch (error) {
      setInitialRoute('Welcome');
    }
  };

  if (initialRoute === null) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="OnboardingGoals" component={OnboardingGoalsScreen} />
        <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
        <Stack.Screen name="AddExam" component={AddExamScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Debug" component={DebugScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings } from '../types/user';
import { Habit } from '../types/habit';
import { getMotivationalMessage } from './motivation';

export const setupNotifications = async () => {
  // Configure behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

export const scheduleNotifications = async (
  settings: NotificationSettings, 
  habits: Habit[]
) => {
  if (!settings.enabled || settings.times.length === 0) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  const hasPermission = await setupNotifications();
  if (!hasPermission) return;

  // Cancel existing to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Smart Frequency Logic:
  // If smart frequency is ON and user has > 80% completion rate for last 7 days, reduce to only 1 notification (preferably morning or evening)
  let timesToSchedule = settings.times;

  if (settings.smartFrequency && habits.length > 0) {
     // Simple check: if streak is high, maybe reduce to just the first time slot
     const avgStreak = habits.reduce((acc, h) => acc + h.streak, 0) / habits.length;
     if (avgStreak > 5) {
         // User is consistent, reduce spam
         timesToSchedule = [settings.times[0]]; 
         console.log('Smart Frequency active: Reducing notifications.');
     }
  }

  for (const time of timesToSchedule) {
    const trigger = {
      hour: time.hour,
      minute: time.minute,
      repeats: true,
    };
    
    // Get dynamic content
    const motivation = getMotivationalMessage(habits);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "HedefimBugün 🎯",
        body: motivation.text,
        sound: true,
      },
      trigger,
    });
    
    console.log(`Notification scheduled for ${time.hour}:${time.minute}`);
  }
};

export const scheduleExamNotification = async (exam: any) => {
    const hasPermission = await setupNotifications();
    if (!hasPermission) return;

    const examDate = new Date(exam.date);
    
    // 1. Notification at the exact time
    if (examDate.getTime() > Date.now()) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `Sınav Vakti Geldi! 🎯`,
                body: `${exam.title} sınavın şimdi başlıyor. Başarılar dileriz! ✨`,
                sound: true,
            },
            trigger: examDate,
        });
    }

    // 2. Notification 1 hour before
    const oneHourBefore = new Date(examDate.getTime() - (60 * 60 * 1000));
    if (oneHourBefore.getTime() > Date.now()) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `Sınav Hatırlatması ⏰`,
                body: `${exam.title} sınavına son 1 saat kaldı. Hazır mısın? 💪`,
                sound: true,
            },
            trigger: oneHourBefore,
        });
    }
    
    // 3. Notification 24 hours before
    const oneDayBefore = new Date(examDate.getTime() - (24 * 60 * 60 * 1000));
    if (oneDayBefore.getTime() > Date.now()) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `Yarın Sınavın Var! 📚`,
                body: `${exam.title} sınavına son 24 saat. Son tekrarlarını yapmayı unutma! 🚀`,
                sound: true,
            },
            trigger: oneDayBefore,
        });
    }
};

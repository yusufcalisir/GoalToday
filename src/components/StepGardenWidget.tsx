import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Keyboard } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { Leaf, Footprints, Sprout, Flower, Trees, Edit2, RotateCw, Save } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabits } from '../context/HabitContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StepGardenWidget = () => {
  const { colors: appColors } = useHabits();
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [manualSteps, setManualSteps] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking'); // 'true', 'false', 'checking'
  const [subscription, setSubscription] = useState<any>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [tempManualInput, setTempManualInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const STORAGE_KEY = `step_garden_manual_${new Date().toISOString().split('T')[0]}`;

  useEffect(() => {
    checkAvailabilityAndInit();
    loadManualSteps();

    return () => {
      stopPedometer();
    };
  }, []);

  const loadManualSteps = async () => {
      try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
              setManualSteps(parseInt(stored, 10));
              // If we have stored manual steps and pedometer is not verified yet, 
              // we might start showing manual steps, but let's wait for checkAvailability.
          }
      } catch (e) {
          console.error("Failed to load manual steps", e);
      }
  };

  const saveManualSteps = async (steps: number) => {
      try {
          await AsyncStorage.setItem(STORAGE_KEY, steps.toString());
          setManualSteps(steps);
      } catch (e) {
          console.error("Failed to save manual steps", e);
      }
  };

  const checkAvailabilityAndInit = async () => {
    try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(String(isAvailable));

        if (isAvailable) {
            startPedometer();
        } else {
            setIsManualMode(true); // Auto fallback
        }
    } catch (e) {
        setIsPedometerAvailable('false');
        setIsManualMode(true);
    }
  };

  const startPedometer = async () => {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    try {
        const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
        if (pastStepCountResult) {
            setCurrentStepCount(pastStepCountResult.steps);
        }

        const sub = Pedometer.watchStepCount(result => {
             // Re-fetch to be accurate with total daily steps
             Pedometer.getStepCountAsync(start, end).then(res => setCurrentStepCount(res.steps));
        });
        setSubscription(sub);
    } catch (e) {
        // If permission denied or error, fallback
        setIsManualMode(true);
    }
  };

  const stopPedometer = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const toggleMode = () => {
      if (isManualMode && isPedometerAvailable === 'true') {
          // Switch to Sensor
          setIsManualMode(false);
          startPedometer();
      } else {
          // Switch to Manual
          setIsManualMode(true);
          stopPedometer();
      }
  };

  const handleSaveManual = () => {
      const steps = parseInt(tempManualInput, 10);
      if (!isNaN(steps)) {
          saveManualSteps(steps);
          setIsEditing(false);
          Keyboard.dismiss();
      } else {
          Alert.alert("Hata", "Lütfen geçerli bir sayı giriniz.");
      }
  };

  // Determine effective steps
  const effectiveSteps = isManualMode ? manualSteps : currentStepCount;

  // Growth Logic
  const getGrowthStage = () => {
      if (effectiveSteps < 1000) return { icon: Leaf, label: 'Tohum', message: 'Biraz hareket et, filizlensin! 🌱', color: '#88B04B' };
      if (effectiveSteps < 2500) return { icon: Sprout, label: 'Filiz', message: 'Harika! Büyümeye başladı. 🌿', color: '#4CAF50' };
      if (effectiveSteps < 5000) return { icon: Flower, label: 'Çiçek', message: 'Çiçek açtı! Parka gitme vakti. 🌸', color: '#E91E63' };
      return { icon: Trees, label: 'Orman', message: 'Doğa sana minnettar! 🌳', color: '#2E7D32' };
  };

  const stage = getGrowthStage();
  const Icon = stage.icon;
  const progressToNext = effectiveSteps < 5000 ? (effectiveSteps % 2500) / 2500 : 1;
  const nextMilestone = effectiveSteps < 1000 ? 1000 : (effectiveSteps < 2500 ? 2500 : (effectiveSteps < 5000 ? 5000 : 0));

  if (isPedometerAvailable === 'checking') return null;

  return (
    <View style={[styles.container, { backgroundColor: appColors.card }]}>
        <LinearGradient
            colors={[stage.color + '20', appColors.card]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: stage.color + '30' }]}>
                <Footprints size={18} color={stage.color} />
            </View>
            <Text style={[styles.title, { color: appColors.text }]}>Adım Bahçesi</Text>
            
            <TouchableOpacity 
                style={[styles.sourceBadge, { backgroundColor: appColors.card, borderColor: appColors.border }]}
                onPress={toggleMode}
                disabled={isPedometerAvailable !== 'true'}
            >
                {isManualMode ? <Edit2 size={10} color={appColors.subText} /> : <RotateCw size={10} color={appColors.subText} />}
                <Text style={[styles.sourceText, { color: appColors.subText }]}>
                    {isManualMode ? 'Manuel' : 'Sensör'}
                </Text>
            </TouchableOpacity>

            <View style={styles.stepBadge}>
                <Text style={[styles.stepText, { color: stage.color }]}>{effectiveSteps} Adım</Text>
            </View>
        </View>

        <View style={styles.content}>
            <View style={[styles.plantContainer, { borderColor: stage.color }]}>
                <Icon size={40} color={stage.color} />
            </View>
            
            <View style={styles.info}>
                {isManualMode && isEditing ? (
                    <View style={styles.inputContainer}>
                        <TextInput 
                            style={[styles.input, { color: appColors.text, borderColor: appColors.primary }]}
                            value={tempManualInput}
                            onChangeText={setTempManualInput}
                            placeholder={manualSteps.toString()}
                            placeholderTextColor={appColors.subText}
                            keyboardType="numeric"
                            autoFocus
                        />
                         <TouchableOpacity onPress={handleSaveManual} style={[styles.saveBtn, { backgroundColor: appColors.primary }]}>
                            <Save size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={[styles.plantName, { color: appColors.text }]}>{stage.label}</Text>
                            {isManualMode && (
                                <TouchableOpacity onPress={() => { setTempManualInput(manualSteps.toString()); setIsEditing(true); }}>
                                    <Edit2 size={16} color={appColors.subText} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={[styles.message, { color: appColors.subText }]}>{stage.message}</Text>
                        
                        {/* Progress Bar */}
                        {nextMilestone > 0 && (
                             <View style={styles.progressTrack}>
                                <View style={[styles.progressBar, { width: `${(effectiveSteps / nextMilestone) * 100}%`, backgroundColor: stage.color }]} />
                             </View>
                        )}
                    </>
                )}
            </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  iconBox: {
      width: 32,
      height: 32,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
  },
  title: {
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
  },
  stepBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.5)',
      marginLeft: 8,
  },
  stepText: {
      fontWeight: '800',
      fontSize: 12,
  },
  sourceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
  },
  sourceText: {
      fontSize: 10,
      fontWeight: '600',
  },
  content: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  plantContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 3,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 20,
      backgroundColor: 'rgba(255,255,255,0.3)',
  },
  info: {
      flex: 1,
  },
  plantName: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 4,
  },
  message: {
      fontSize: 13,
      marginBottom: 10,
      lineHeight: 18,
  },
  progressTrack: {
      height: 6,
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 3,
      overflow: 'hidden',
  },
  progressBar: {
      height: '100%',
      borderRadius: 3,
  },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
  },
  input: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      fontWeight: 'bold',
  },
  saveBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
  }
});

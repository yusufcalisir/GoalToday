import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Animated,
  Keyboard,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useHabits } from '../context/HabitContext';
import { CATEGORY_OPTIONS } from '../types/user';
import { Plus, Check, Target, PartyPopper, Trash2 } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandLogo } from '../components/BrandLogo';

export default function OnboardingGoalsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { addMultipleHabits, colors: appColors } = useHabits();

  const [title, setTitle] = useState('');
  const [tempHabits, setTempHabits] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const listFade = useRef(new Animated.Value(0)).current;

  // Pulse animation for the start button
  useEffect(() => {
    if (tempHabits.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      buttonScale.setValue(1); 
    }
  }, [tempHabits]);

  const handleAddGoal = () => {
    if (!title.trim()) {
      Alert.alert('Hedef Adı Eksik', 'Lütfen başarmak istediğin bir hedef yaz.');
      return;
    }

    const newGoal = {
      title: title.trim(),
      category: 'other', 
      color: appColors.primary, 
      icon: 'star', 
      frequency: 'daily',
    };

    setTempHabits([...tempHabits, newGoal]);
    setTitle('');
    Keyboard.dismiss();
    
    // Animate list entry
    listFade.setValue(0);
    Animated.timing(listFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
    }).start();
  };

  const removeGoal = (index: number) => {
      const newHabits = [...tempHabits];
      newHabits.splice(index, 1);
      setTempHabits(newHabits);
  };

  const handleFinish = () => {
    if (tempHabits.length === 0) {
      Alert.alert('Hazır mısın?', 'Başlamadan önce kendine en az bir hedef belirle.');
      return;
    }

    // Save all goals to context at once
    addMultipleHabits(tempHabits);

    // Navigate to Main
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
          colors={appColors.backgroundGradient as string[]}
          style={StyleSheet.absoluteFillObject}
      />
      
      {/* Confetti Overlay */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
           <ConfettiCannon count={200} origin={{x: -10, y: 0}} autoStart={true} fadeOut={true} />
        </View>
      )}

      <ScrollView 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
            paddingTop: insets.top + 50,
            paddingBottom: 200 
        }}
      >
        {/* Header moved inside ScrollView for better responsiveness */}
        <View style={styles.header}>
            <BrandLogo size={60} showBackground={true} style={{ marginBottom: 20 }} />
            <Text style={[styles.title, { color: appColors.text }]}>Bugünlük Hedefin</Text>
            <Text style={[styles.subtitle, { color: appColors.subText }]}>
                Büyük değişimler küçük bir adımla başlar.{'\n'}Listene bir hedef ekleyerek başla.
            </Text>
        </View>

        {/* Input Card */}
        {/* Input Card */}
        <View style={[styles.inputCard, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
            <View style={[styles.inputBadge, { backgroundColor: appColors.primary }]}>
                <Text style={styles.inputBadgeText}>YENİ HEDEFİN</Text>
            </View>
            
            <TextInput
                style={[styles.input, { color: appColors.text, borderColor: appColors.border }]}
                placeholder="Örn: 20 Sayfa Kitap Oku"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={appColors.subText}
                selectionColor={appColors.primary}
            />
            
            <View style={{ height: 10 }} />

            <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: appColors.primary }]} 
                onPress={handleAddGoal}
                activeOpacity={0.8}
            >
                <Plus size={20} color="white" strokeWidth={3} />
                <Text style={[styles.addButtonText, { color: 'white' }]}>Listeme Ekle</Text>
            </TouchableOpacity>
        </View>

        {/* List of Goals */}
        <Animated.View style={[styles.listContainer, { opacity: listFade }]}>
            {tempHabits.length > 0 && (
                 <Text style={[styles.sectionTitle, { color: appColors.subText }]}>SENİN LİSTEN ({tempHabits.length})</Text>
            )}
            
            {tempHabits.map((item, index) => (
                 <View key={index} style={[styles.goalItem, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
                    <View style={styles.goalLeft}>
                        <View style={[styles.goalIconBox, { backgroundColor: appColors.inputBg }]}>
                             <Target size={20} color={appColors.primary} />
                        </View>
                        <View>
                            <Text style={[styles.goalTitle, { color: appColors.text }]}>{item.title}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => removeGoal(index)} style={styles.deleteBtn}>
                        <Trash2 size={18} color={appColors.error} opacity={0.7} />
                    </TouchableOpacity>
                 </View>
            ))}
        </Animated.View>
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
         <TouchableOpacity 
            onPress={handleFinish}
            activeOpacity={0.8}
            disabled={tempHabits.length === 0}
            style={styles.finishButtonRoot}
         >
             <Animated.View style={[
                  styles.finishButton, 
                  { 
                      backgroundColor: tempHabits.length > 0 ? appColors.primary : '#E0E0E0', // Solid light gray for disabled
                      transform: [{ scale: buttonScale }],
                      shadowColor: tempHabits.length > 0 ? appColors.primary : 'transparent'
                  }
             ]}>
                <Text style={[styles.finishButtonText, tempHabits.length === 0 && { color: '#9E9E9E' }]}>Yolculuğa Başla 🚀</Text>
             </Animated.View>
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  header: {
    marginBottom: 30,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    opacity: 0.7,
  },
  inputCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    backgroundColor: 'white', // Ensure solid background
    borderWidth: 1,
    position: 'relative',
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  inputBadge: {
    position: 'absolute',
    top: -10,
    left: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000', // Added shadow for pop
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputBadgeText: {
    color: 'white',
    fontWeight: '800', // Slightly lighter weight for better readability
    fontSize: 11,
    letterSpacing: 1,
  },
  input: {
    fontSize: 22, // Slightly smaller for better fit
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    letterSpacing: -0.5,
    minHeight: 80,
    borderWidth: 1, // Added border
    borderColor: 'rgba(0,0,0,0.05)', // Subtle border
    backgroundColor: '#F8F9FA', // Solid light gray instead of transparent
    textAlignVertical: 'top', // Ensure text starts at top
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16, // Reduced padding slightly
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  addButtonText: {
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  listContainer: {
    marginTop: 10,
    paddingHorizontal: 24,
  },
  sectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      marginBottom: 15,
      letterSpacing: 1,
      textTransform: 'uppercase',
      opacity: 0.6,
  },
  goalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 18,
      marginBottom: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
  },
  goalLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
      flex: 1, // Allow text to take space
  },
  goalIconBox: {
      width: 44, // Slightly smaller
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
  },
  goalTitle: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.3,
      flexShrink: 1, // Allow text to wrap/shrink
  },
  deleteBtn: {
      padding: 8,
      borderRadius: 10,
      backgroundColor: 'rgba(239, 68, 68, 0.1)', // More visible bg
  },
  footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingTop: 20,
      backgroundColor: 'rgba(255,255,255,0.9)', // Added slight background to ensure visibility
  },
  finishButtonRoot: {
      marginBottom: 20, // Adjusted margin
  },
  finishButton: {
      height: 60, // Standard height
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
      flexDirection: 'row',
      gap: 10,
  },
  finishButtonText: {
      color: 'white',
      fontWeight: '800',
      fontSize: 17,
      letterSpacing: 0.5,
  },
});

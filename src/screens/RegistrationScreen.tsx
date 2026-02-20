import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useHabits } from '../context/HabitContext';
import { AVATAR_OPTIONS, CATEGORY_OPTIONS, UserProfile } from '../types/user';
import { ArrowRight, Check, ChevronLeft, Camera, Image as ImageIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const RegistrationScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { updateUserProfile, colors: appColors } = useHabits();

  const [step, setStep] = useState(1); // 1: Name, 2: Avatar, 3: Student, 4: Categories
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step / 4) * 100,
      duration: 500,
      useNativeDriver: false, // Width doesn't support native driver
    }).start();

    // Reset and animate slide for new step
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

  }, [step]);

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(prev => prev.filter(c => c !== id));
    } else {
      if (selectedCategories.length < 3) {
        setSelectedCategories(prev => [...prev, id]);
      } else {
        Alert.alert('Dikkat', 'En fazla 3 ilgi alanı seçebilirsiniz.');
      }
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Eksik Bilgi', 'Lütfen isminizi giriniz.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setSelectedAvatar(''); // Clear emoji selection
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("İzin Gerekli", "Kamerayı kullanmak için izin vermeniz gerekiyor.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setSelectedAvatar(''); // Clear emoji selection
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Eksik Bilgi', 'Lütfen en az bir ilgi alanı seçin.');
      return;
    }

    const profile: UserProfile = {
      name: name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
      avatar: selectedAvatar,
      photoUri: photoUri || undefined,
      categories: selectedCategories,
      isOnboarded: true,
      theme: 'light',
      accentColor: '#6C63FF',
      points: 0,
      notificationSettings: {
        enabled: true,
        times: [{ hour: 9, minute: 0 }],
        smartFrequency: false
      },
      isStudent: isStudent
    };

    updateUserProfile(profile);
    navigation.replace('OnboardingGoals'); 
  };
  
  // Render Helpers
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.questionText, { color: appColors.text }]}>Sana nasıl hitap edelim?</Text>
      <Text style={[styles.subQuestionText, { color: appColors.subText }]}>Seni daha yakından tanımak isteriz.</Text>
      
      <View style={[styles.inputContainer, { borderColor: appColors.primary }]}>
          <TextInput
            style={[styles.input, { color: appColors.text }]}
            placeholder="İsminiz..."
            placeholderTextColor={appColors.subText}
            value={name}
            onChangeText={setName}
            autoFocus
          />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.questionText, { color: appColors.text }]}>Avatarını Seç</Text>
      <Text style={[styles.subQuestionText, { color: appColors.subText }]}>Tarzını yansıtan bir görsel seç.</Text>
      
      <View style={styles.avatarGrid}>
        {/* Custom Photo Option */}
        <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.avatarItem,
              { backgroundColor: appColors.card, borderStyle: 'dashed' },
              photoUri ? { borderColor: appColors.primary, borderStyle: 'solid' } : null,
            ]}
            onPress={() => {
                Alert.alert(
                    "Fotoğraf Seç",
                    "Profil fotoğrafını nereden seçmek istersin?",
                    [
                        { text: "Kamera", onPress: handleTakePhoto },
                        { text: "Galeri", onPress: handlePickImage },
                        { text: "Vazgeç", style: "cancel" }
                    ]
                );
            }}
          >
            {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.fullAvatarImage} />
            ) : (
                <Camera size={30} color={appColors.primary} />
            )}
            {photoUri && (
                <View style={[styles.checkBadge, { backgroundColor: appColors.primary }]}>
                    <Check size={12} color="white" strokeWidth={3} />
                </View>
            )}
          </TouchableOpacity>

        {AVATAR_OPTIONS.map((avatar) => (
          <TouchableOpacity
            key={avatar}
            activeOpacity={0.7}
            style={[
              styles.avatarItem,
              { backgroundColor: appColors.card },
              selectedAvatar === avatar && !photoUri ? { borderColor: appColors.primary, backgroundColor: appColors.primary + '15', transform: [{scale: 1.05}] } : null,
            ]}
            onPress={() => {
                setSelectedAvatar(avatar);
                setPhotoUri(null);
            }}
          >
            <Text style={styles.avatarText}>{avatar}</Text>
            {selectedAvatar === avatar && !photoUri && (
                <View style={[styles.checkBadge, { backgroundColor: appColors.primary }]}>
                    <Check size={12} color="white" strokeWidth={3} />
                </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
      <View style={styles.stepContent}>
          <Text style={[styles.questionText, { color: appColors.text }]}>Sınavlara hazırlanıyor musun?</Text>
          <Text style={[styles.subQuestionText, { color: appColors.subText }]}>
              Öğrenciysen sınav takibi modülünü senin için hazırladık.
          </Text>
          
          <View style={{ gap: 16, marginTop: 20 }}>
            <TouchableOpacity 
                activeOpacity={0.8}
                style={[
                    styles.selectionButton, 
                    { backgroundColor: appColors.card, borderColor: appColors.border },
                    isStudent && { borderColor: appColors.primary, backgroundColor: appColors.primary + '10' }
                ]}
                onPress={() => setIsStudent(true)}
            >
                <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                    <Text style={{ fontSize: 24 }}>📚</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.selectionTitle, { color: appColors.text }]}>Evet, Öğrenciyim</Text>
                    <Text style={[styles.selectionSubtitle, { color: appColors.subText }]}>Sınav takibi modülü aktif olsun.</Text>
                </View>
                {isStudent && <Check size={20} color={appColors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity 
                activeOpacity={0.8}
                style={[
                    styles.selectionButton, 
                    { backgroundColor: appColors.card, borderColor: appColors.border },
                    !isStudent && { borderColor: appColors.primary, backgroundColor: appColors.primary + '10' }
                ]}
                onPress={() => setIsStudent(false)}
            >
                <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={{ fontSize: 24 }}>🎯</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.selectionTitle, { color: appColors.text }]}>Kişisel Gelişim</Text>
                    <Text style={[styles.selectionSubtitle, { color: appColors.subText }]}>Sadece hedef takibi yapmak istiyorum.</Text>
                </View>
                {!isStudent && <Check size={20} color={appColors.primary} />}
            </TouchableOpacity>
          </View>
      </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.questionText, { color: appColors.text }]}>İlgi Alanların</Text>
      <Text style={[styles.subQuestionText, { color: appColors.subText }]}>
        En fazla 3 adet seçebilirsin.
      </Text>
      
      <View style={styles.categoriesGrid}>
        {CATEGORY_OPTIONS.map((cat) => {
          const isSelected = selectedCategories.includes(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              style={[
                styles.categoryItem,
                { backgroundColor: appColors.card, borderColor: appColors.border },
                isSelected && { borderColor: appColors.primary, backgroundColor: appColors.primary + '10' },
              ]}
              onPress={() => toggleCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: appColors.text },
                  isSelected && { color: appColors.primary, fontWeight: '700' },
                ]}
              >
                {cat.label}
              </Text>
              {isSelected && (
                <View style={[styles.checkIcon, { backgroundColor: appColors.primary }]}>
                  <Check size={12} color="white" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={appColors.backgroundGradient as string[]}
                style={StyleSheet.absoluteFillObject}
            />
            {/* Header with Progress */}
            <View style={styles.header}>
                <View style={styles.navBar}>
                    {step > 1 ? (
                        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
                            <ChevronLeft size={28} color={appColors.text} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 28 }} /> 
                    )}
                    <View style={styles.progressTrack}>
                        <Animated.View 
                            style={[
                                styles.progressBar, 
                                { 
                                    backgroundColor: appColors.primary,
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%']
                                    })
                                }
                            ]} 
                        />
                    </View>
                    <View style={{ width: 28 }} /> 
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View 
                    style={{ 
                        flex: 1, 
                        opacity: fadeAnim, 
                        transform: [{ translateY: slideAnim }] 
                    }}
                >
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </Animated.View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: appColors.primary, shadowColor: appColors.primary }]} 
                    onPress={step === 4 ? handleComplete : handleNext} 
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>{step === 4 ? 'Tamamla' : 'Devam Et'}</Text>
                    <ArrowRight color="white" size={20} strokeWidth={2.5} style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            </View>
        </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  iconBtn: {
    padding: 4,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, 
  },
  stepContent: {
    flex: 1,
    paddingTop: 10,
  },
  questionText: {
    fontSize: 28, // Bigger
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subQuestionText: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(0,0,0,0.02)', // Input bg
  },
  input: {
    padding: 18,
    fontSize: 20,
    fontWeight: '600',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
  },
  avatarItem: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  avatarText: {
    fontSize: 40,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  fullAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  selectionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 20,
      borderWidth: 2,
      marginBottom: 0,
  },
  iconBox: {
      width: 50,
      height: 50,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  selectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 2,
  },
  selectionSubtitle: {
      fontSize: 13,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '48%', 
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  categoryIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: 'transparent', 
  },
  button: {
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

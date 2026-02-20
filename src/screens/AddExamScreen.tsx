import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useHabits } from '../context/HabitContext';
import { ArrowLeft, Check, Plus } from 'lucide-react-native';
import { PREDEFINED_EXAMS } from '../utils/examUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { scheduleExamNotification } from '../utils/notifications';

export const AddExamScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { addExam, deleteExam, exams, colors: appColors } = useHabits();

  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedPredefined, setSelectedPredefined] = useState<string | null>(null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(newDate);
    }
  };

    const handlePredefinedSelect = (exam: { title: string, category: string, date: string }) => {
        const existing = exams.find(e => e.title === exam.title);
        
        if (existing) {
            deleteExam(existing.id);
            setSelectedPredefined(null);
            if (title === exam.title) {
                setTitle('');
                setDate(new Date());
            }
        } else {
            setSelectedPredefined(exam.title);
            setTitle(exam.title);
            setDate(new Date(exam.date));
        }
    };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Lütfen sınav adı girin.');
      return;
    }

    // Check for duplicates
    const isDuplicate = exams.some(e => e.title.toLowerCase() === title.trim().toLowerCase());
    if (isDuplicate) {
        Alert.alert('Hata', 'Bu sınav zaten listenizde bulunuyor.');
        return;
    }

    const newExam = {
      id: Date.now().toString(),
      title: title.trim(),
      goal: goal.trim(),
      date: date.toISOString(),
      category: 'Other' as const 
    };

    addExam(newExam);
    scheduleExamNotification(newExam);

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
          colors={appColors.backgroundGradient as string[]}
          style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: appColors.card }]}>
          <ArrowLeft size={22} color={appColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appColors.text }]}>Yeni Sınav</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        {/* Predefined Exams */}
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: appColors.text }]}>Hızlı Ekle</Text>
            <View style={[styles.titleLine, { backgroundColor: appColors.primary }]} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.predefinedScroll}>
            {PREDEFINED_EXAMS.map((exam) => {
                const isAdded = exams.some(e => e.title === exam.title);
                return (
                    <TouchableOpacity 
                        key={exam.title}
                        style={[
                            styles.predefinedCard, 
                            { backgroundColor: appColors.card, borderColor: appColors.border },
                            (selectedPredefined === exam.title || isAdded) && { borderColor: appColors.primary, backgroundColor: appColors.primary + '15' },
                        ]}
                        onPress={() => handlePredefinedSelect(exam)}
                    >
                        <View style={[styles.examIconCircle, { backgroundColor: isAdded ? appColors.primary + '20' : appColors.primary + '10' }]}>
                             {isAdded ? <Check size={16} color={appColors.primary} /> : <Plus size={16} color={appColors.primary} />}
                        </View>
                        <Text style={[styles.predefinedTitle, { color: appColors.text }]} numberOfLines={1}>{exam.title}</Text>
                        <Text style={[styles.predefinedDate, { color: appColors.subText }]}>
                            {isAdded ? 'Eklendi' : new Date(exam.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>

        {/* Custom Input */}
        <View style={[styles.sectionHeader, { marginTop: 30 }]}>
            <Text style={[styles.sectionTitle, { color: appColors.text }]}>Sınav Detayları</Text>
            <View style={[styles.titleLine, { backgroundColor: appColors.primary }]} />
        </View>
        
        <View style={[styles.inputGroup, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
            <Text style={[styles.label, { color: appColors.subText }]}>SINAV ADI</Text>
            <TextInput
                style={[styles.input, { color: appColors.text }]}
                value={title}
                onChangeText={(text) => {
                    setTitle(text);
                    setSelectedPredefined(null);
                }}
                placeholder="Örn: TYT - Matematik"
                placeholderTextColor={appColors.subText}
            />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
            <Text style={[styles.label, { color: appColors.subText }]}>TARİH</Text>
            {Platform.OS === 'web' ? (
                <input
                    type="date"
                    value={date.toISOString().split('T')[0]}
                    onChange={(e) => {
                        const newDate = new Date(date);
                        const [year, month, day] = e.target.value.split('-');
                        newDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
                        setDate(newDate);
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: appColors.text,
                        fontSize: 16,
                        fontFamily: 'inherit',
                        outline: 'none',
                        width: '100%',
                        padding: '5px 0'
                    }}
                />
            ) : (
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={[styles.dateText, { color: appColors.text }]}>
                        {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                </TouchableOpacity>
            )}
        </View>

        <View style={[styles.inputGroup, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
            <Text style={[styles.label, { color: appColors.subText }]}>SAAT</Text>
            {Platform.OS === 'web' ? (
                <input
                    type="time"
                    value={`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`}
                    onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(date);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setDate(newDate);
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: appColors.text,
                        fontSize: 16,
                        fontFamily: 'inherit',
                        outline: 'none',
                        width: '100%',
                        padding: '5px 0'
                    }}
                />
            ) : (
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateButton}>
                    <Text style={[styles.dateText, { color: appColors.text }]}>
                        {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </TouchableOpacity>
            )}
        </View>

        {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
            />
        )}

        {showTimePicker && Platform.OS !== 'web' && (
            <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={handleTimeChange}
            />
        )}

        <View style={styles.inputSection}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: appColors.text }]}>Hedefim</Text>
                <View style={[styles.titleLine, { backgroundColor: appColors.primary, width: 40 }]} />
            </View>
            <View style={[styles.inputContainer, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
                <TextInput
                    style={[styles.input, { color: appColors.text }]}
                    placeholder="Örn: ODTÜ Mimarlık veya 450 Puan"
                    placeholderTextColor={appColors.subText}
                    value={goal}
                    onChangeText={setGoal}
                />
            </View>
        </View>

        <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: appColors.primary, shadowColor: appColors.primary }]} 
            onPress={handleSave}
            activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Sınavı Kaydet ✨</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
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
  content: {
    padding: 24,
  },
  sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleLine: {
      flex: 1,
      height: 1,
      opacity: 0.1,
  },
  predefinedScroll: {
    gap: 12,
    paddingRight: 24,
  },
  predefinedCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    width: 150,
    gap: 8,
  },
  examIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
  },
  predefinedTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  predefinedDate: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  inputGroup: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    fontWeight: '700',
    paddingVertical: 5,
  },
  dateButton: {
    paddingVertical: 5,
  },
  dateText: {
    fontSize: 17,
    fontWeight: '700',
  },
  inputSection: {
      marginTop: 20,
      marginBottom: 10,
  },
  inputContainer: {
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 22,
    marginTop: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    gap: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  }
});

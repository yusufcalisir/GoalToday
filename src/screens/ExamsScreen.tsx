import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions, Platform, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useHabits } from '../context/HabitContext';
import { Plus, GraduationCap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ExamCountdownWidget } from '../components/ExamCountdownWidget';

const { width } = Dimensions.get('window');

export const ExamsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { exams, deleteExam, updateExam, colors: appColors, userProfile, updateUserProfile } = useHabits();
  
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  
  // Removed unified nextExam logic as each exam is now a full widget

  // Individual timer logic moved into ExamWidget component

  const handleAddExam = () => {
    navigation.navigate('AddExam');
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
        const confirmed = window.confirm("Bu sınavı silmek istediğinize emin misiniz?");
        if (confirmed) deleteExam(id);
    } else {
        Alert.alert(
            "Sınavı Sil",
            "Bu sınavı takip listenizden kaldırmak istiyor musunuz?",
            [
                { text: "Vazgeç", style: 'cancel' },
                { text: "Sil", style: 'destructive', onPress: () => deleteExam(id) }
            ]
        );
    }
  };

  const handleEditGoal = (exam: any) => {
      setEditingExamId(exam.id);
      setGoalInput(exam.goal || '');
      setIsGoalModalVisible(true);
  };

  const handleSaveGoal = () => {
      if (editingExamId) {
          const exam = exams.find(e => e.id === editingExamId);
          if (exam) {
              updateExam({ ...exam, goal: goalInput.trim() });
          }
      }
      setIsGoalModalVisible(false);
      setEditingExamId(null);
  };



  return (
    <View style={styles.container}>
      <LinearGradient
          colors={appColors.backgroundGradient as string[]}
          style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: appColors.subText }]}>Başarıya Giden Yol</Text>
          <Text style={[styles.title, { color: appColors.text }]}>Sınavlarım</Text>
        </View>
        <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: appColors.primary, shadowColor: appColors.primary }]}
            onPress={handleAddExam}
            activeOpacity={0.8}
        >
          <Plus size={24} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={exams}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ExamCountdownWidget 
            exam={item} 
            appColors={appColors} 
            onDelete={() => handleDelete(item.id)}
            onEditGoal={() => handleEditGoal(item)}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          exams.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
              {/* ... same empty content ... */}
              <LinearGradient
                  colors={[appColors.primary + '10', 'transparent']}
                  style={styles.emptyGradient}
              />
              <View style={[styles.emptyIconCircle, { backgroundColor: appColors.primary + '15' }]}>
                  <GraduationCap size={48} color={appColors.primary} />
              </View>
              <Text style={[styles.emptyText, { color: appColors.text }]}>Gelecek Planlarını Ekle</Text>
              <Text style={[styles.emptySubText, { color: appColors.subText }]}>
                Önündeki büyük sınavları buraya ekleyerek geri sayımı takip et ve motivasyonunu yüksek tut.
              </Text>
              
              <TouchableOpacity 
                  style={[styles.emptyButton, { backgroundColor: appColors.primary, shadowColor: appColors.primary }]} 
                  onPress={handleAddExam}
              >
                  <Text style={styles.emptyButtonText}>İlk Sınavını Kaydet ✨</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* Goal Modal */}
      <Modal
        visible={isGoalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsGoalModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
        >
            <TouchableOpacity 
                style={styles.modalBackground} 
                activeOpacity={1} 
                onPress={() => setIsGoalModalVisible(false)} 
            />
            <View style={[styles.modalCard, { backgroundColor: appColors.card }]}>
                <LinearGradient
                    colors={[appColors.primary + '15', 'transparent']}
                    style={styles.modalGradient}
                />
                <View style={[styles.modalIconBox, { backgroundColor: appColors.primary + '12' }]}>
                    <GraduationCap size={32} color={appColors.primary} />
                </View>
                <Text style={[styles.modalTitle, { color: appColors.text }]}>Hedefini Belirle</Text>
                <Text style={[styles.modalSubtitle, { color: appColors.subText }]}>
                    Hayalindeki üniversite, bölüm veya hedeflediğin puan nedir?
                </Text>
                
                <View style={[styles.modalInputContainer, { backgroundColor: appColors.inputBg || appColors.border + '15' }]}>
                    <TextInput
                        style={[styles.modalInput, { color: appColors.text }]}
                        placeholder="Örn: ODTÜ Mimarlık"
                        placeholderTextColor={appColors.subText}
                        value={goalInput}
                        onChangeText={setGoalInput}
                        autoFocus
                    />
                </View>

                <View style={styles.modalFooter}>
                    <TouchableOpacity 
                        style={styles.cancelBtn} 
                        onPress={() => setIsGoalModalVisible(false)}
                    >
                        <Text style={[styles.cancelBtnText, { color: appColors.subText }]}>Vazgeç</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: appColors.primary }]} 
                        onPress={handleSaveGoal}
                    >
                        <Text style={styles.saveBtnText}>Kaydet ✨</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  decorativeCircle: {
      position: 'absolute',
      borderRadius: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerLeft: {
      flex: 1,
  },
  greeting: {
      fontSize: 14,
      fontWeight: '600',
      opacity: 0.6,
      marginBottom: 2,
  },
  title: {
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  listContent: {
    padding: 24,
    paddingBottom: 120,
  },
  nextExamWidget: {
      borderRadius: 32,
      marginBottom: 32,
      borderWidth: 1,
      overflow: 'hidden',
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 6,
  },
  widgetGradient: {
      ...StyleSheet.absoluteFillObject,
  },
  widgetContent: {
      zIndex: 1,
  },
  widgetTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  widgetBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 6,
  },
  widgetBadgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
  },
  widgetDeleteBtn: {
      width: 28,
      height: 28,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
  },
  countdownLarge: {
      fontSize: 24,
      fontWeight: '900',
  },
  countdownUnit: {
      fontSize: 12,
      fontWeight: '700',
      opacity: 0.6,
  },
  widgetTitle: {
      fontSize: 26,
      fontWeight: '900',
      marginBottom: 8,
      letterSpacing: -0.5,
  },
  widgetMotivation: {
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 22,
      marginBottom: 20,
      opacity: 0.8,
  },
  progressBarContainer: {
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
  },
  progressBarFill: {
      height: '100%',
      borderRadius: 4,
  },
  widgetWrapper: {
      gap: 16,
      marginBottom: 32,
  },
  circularCard: {
      borderRadius: 32,
      padding: 24,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
      elevation: 4,
  },
  circularHeader: {
      marginBottom: 20,
      alignItems: 'center',
  },
  circularLabel: {
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 2,
  },
  circularContent: {
      alignItems: 'center',
  },
  svgWrapper: {
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
  },
  circularSvg: {
      transform: [{ rotate: '0deg' }],
  },
  circularTextContainer: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
  },
  circularDays: {
      fontSize: 42,
      fontWeight: '900',
      lineHeight: 42,
  },
  circularUnit: {
      fontSize: 12,
      fontWeight: '800',
      marginTop: -4,
  },
  timeBreakdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 20,
  },
  timeItem: {
      alignItems: 'center',
      flex: 1,
  },
  timeVal: {
      fontSize: 24,
      fontWeight: '900',
      fontVariant: ['tabular-nums'],
  },
  timeLabel: {
      fontSize: 10,
      fontWeight: '600',
      opacity: 0.7,
      marginTop: 2,
  },
  timeColon: {
      fontSize: 24,
      fontWeight: '300',
      marginBottom: 16,
      opacity: 0.3,
  },
  goalContainer: {
      padding: 24,
      borderRadius: 32,
      borderWidth: 1,
      marginTop: 20,
      gap: 16,
  },
  goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  goalTitle: {
      fontSize: 18,
      fontWeight: '800',
  },
  goalContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderRadius: 20,
  },
  goalText: {
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
      marginRight: 10,
  },
  goalPlaceholder: {
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
      marginRight: 10,
  },
  modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
  },
  modalBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
      borderRadius: 36,
      padding: 32,
      overflow: 'hidden',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
  },
  modalGradient: {
      ...StyleSheet.absoluteFillObject,
  },
  modalIconBox: {
      width: 80,
      height: 80,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      alignSelf: 'center',
  },
  modalTitle: {
      fontSize: 24,
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: 10,
      letterSpacing: -0.5,
  },
  modalSubtitle: {
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
      opacity: 0.7,
  },
  modalInputContainer: {
      borderRadius: 22,
      padding: 16,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
  },
  modalInput: {
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
  },
  modalFooter: {
      flexDirection: 'row',
      gap: 12,
  },
  cancelBtn: {
      flex: 1,
      paddingVertical: 18,
      alignItems: 'center',
  },
  cancelBtnText: {
      fontSize: 16,
      fontWeight: '700',
  },
  saveBtn: {
      flex: 2,
      paddingVertical: 18,
      borderRadius: 20,
      alignItems: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
  },
  saveBtnText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '900',
  },
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  smallIconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  cardMainInfo: {
      flex: 1,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
  },
  examDate: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
  },
  dayBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      alignItems: 'center',
      marginRight: 10,
      minWidth: 50,
  },
  dayValue: {
      fontSize: 16,
      fontWeight: '900',
  },
  dayLabel: {
      fontSize: 8,
      fontWeight: '900',
      marginTop: -2,
  },
  moreBtn: {
      padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 36,
    marginTop: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  emptyGradient: {
      ...StyleSheet.absoluteFillObject,
  },
  emptyIconCircle: {
      width: 90,
      height: 90,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      transform: [{ rotate: '-10deg' }],
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 10,
    opacity: 0.7,
  },
  emptyButton: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  }
});

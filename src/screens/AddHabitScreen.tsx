import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useHabits } from '../context/HabitContext';
import { colors } from '../constants/colors';
import { CheckCircle2, Sparkles, Plus, X, Calendar, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getSmartSuggestions, Suggestion } from '../utils/suggestions';

const COLOR_OPTIONS = [
  '#6C63FF', '#FF6584', '#00B894', '#0984E3', '#FDCB6E', '#E17055', '#636E72', '#D63031'
];

const DAYS = [
  { id: 1, label: 'Pzt' },
  { id: 2, label: 'Sal' },
  { id: 3, label: 'Çar' },
  { id: 4, label: 'Per' },
  { id: 5, label: 'Cum' },
  { id: 6, label: 'Cmt' },
  { id: 0, label: 'Paz' },
];

const SuggestionsList = ({ onSelect }: { onSelect: (s: Suggestion) => void }) => {
    const { habits, colors: appColors } = useHabits();
    const suggestions = getSmartSuggestions(habits);

    if (suggestions.length === 0) return null;

    return (
        <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsHeader}>
                <View style={[styles.sparkleIcon, { backgroundColor: appColors.primary + '15' }]}>
                    <Sparkles size={14} color={appColors.primary} fill={appColors.primary + '20'} />
                </View>
                <Text style={[styles.suggestionsTitle, { color: appColors.text }]}>Senin İçin Öneriler</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll} contentContainerStyle={{ paddingRight: 20 }}>
                {suggestions.map((item) => (
                    <TouchableOpacity 
                        key={item.id} 
                        style={[styles.suggestionCard, { backgroundColor: appColors.card, borderColor: appColors.border }]} 
                        onPress={() => onSelect(item)}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={[item.color + '10', item.color + '05']}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <View style={[styles.suggestionIcon, { backgroundColor: item.color + '20' }]}>
                            <Text style={{ fontSize: 20 }}>{item.icon}</Text> 
                        </View>
                        <View style={styles.suggestionInfo}>
                            <Text style={[styles.suggestionText, { color: appColors.text }]} numberOfLines={1}>{item.title}</Text>
                            <Text style={[styles.suggestionReason, { color: appColors.subText }]} numberOfLines={2}>{item.reason}</Text>
                        </View>
                        <View style={[styles.addIconBtn, { backgroundColor: appColors.primary, shadowColor: appColors.primary }]}>
                             <Plus size={12} color="white" strokeWidth={3} />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export const AddHabitScreen = () => {
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
    const [frequency, setFrequency] = useState<'daily' | 'specific'>('daily');
    const [specificDays, setSpecificDays] = useState<number[]>([]);
    
    const { addHabit, colors: appColors } = useHabits();
    const navigation = useNavigation<any>();

    const toggleDay = (dayId: number) => {
        if (specificDays.includes(dayId)) {
            setSpecificDays(prev => prev.filter(d => d !== dayId));
        } else {
            setSpecificDays(prev => [...prev, dayId]);
        }
    };

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Hata', 'Lütfen bir hedef ismi girin.');
            return;
        }

        if (frequency === 'specific' && specificDays.length === 0) {
            Alert.alert('Hata', 'Lütfen en az bir gün seçin.');
            return;
        }

        addHabit({
            title: title.trim(),
            category: 'general',
            color: selectedColor,
            icon: 'star',
            frequency,
            specificDays: frequency === 'specific' ? specificDays : undefined,
        });

        setTitle('');
        setFrequency('daily');
        setSpecificDays([]);
        navigation.navigate('Home');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={appColors.backgroundGradient as string[]}
                style={StyleSheet.absoluteFillObject}
            />
            
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color={appColors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: appColors.text }]}>Yeni Hedef</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <ScrollView 
                    contentContainerStyle={[
                        styles.scrollContent, 
                        { paddingBottom: insets.bottom + 100 }
                    ]} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    
                    <View style={[styles.card, { backgroundColor: appColors.card }]}>
                        <Text style={[styles.label, { color: appColors.text }]}>Hedef İsmi</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: appColors.inputBg, color: appColors.text }]}
                            placeholder="Örn: Günde 2 litre su iç"
                            placeholderTextColor={appColors.subText}
                            value={title}
                            onChangeText={setTitle}
                            autoFocus
                        />
                    </View>

                    {/* Smart Suggestions */}
                    <SuggestionsList onSelect={(suggestion) => {
                        setTitle(suggestion.title);
                        setSelectedColor(suggestion.color);
                    }} />

                    {/* Frequency Selection */}
                    <View style={[styles.card, { backgroundColor: appColors.card }]}>
                        <Text style={[styles.label, { color: appColors.text }]}>Sıklık</Text>
                        <View style={[styles.frequencyContainer, { backgroundColor: appColors.inputBg }]}>
                            <TouchableOpacity 
                                style={[styles.freqOption, frequency === 'daily' && { backgroundColor: appColors.primary, shadowColor: appColors.primary }]}
                                onPress={() => setFrequency('daily')}
                            >
                                <Text style={[styles.freqText, { color: appColors.subText }, frequency === 'daily' && { color: 'white', fontWeight: 'bold' }]}>Her Gün</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.freqOption, frequency === 'specific' && { backgroundColor: appColors.primary, shadowColor: appColors.primary }]}
                                onPress={() => setFrequency('specific')}
                            >
                                <Text style={[styles.freqText, { color: appColors.subText }, frequency === 'specific' && { color: 'white', fontWeight: 'bold' }]}>Belirli Günler</Text>
                            </TouchableOpacity>
                        </View>

                        {frequency === 'specific' && (
                            <View style={styles.daysGrid}>
                                {DAYS.map((day) => {
                                    const isSelected = specificDays.includes(day.id);
                                    return (
                                        <TouchableOpacity 
                                            key={day.id} 
                                            style={[
                                                styles.dayButton, 
                                                { backgroundColor: appColors.inputBg }, 
                                                isSelected && { backgroundColor: appColors.primary }
                                            ]}
                                            onPress={() => toggleDay(day.id)}
                                        >
                                            <Text style={[styles.dayText, { color: appColors.subText }, isSelected && { color: 'white' }]}>{day.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={[styles.card, { backgroundColor: appColors.card }]}>
                        <Text style={[styles.label, { color: appColors.text }]}>Renk Teması</Text>
                        <View style={styles.colorGrid}>
                            {COLOR_OPTIONS.map(color => (
                                <TouchableOpacity 
                                    key={color} 
                                    style={[
                                        styles.colorOption, 
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColor
                                    ]} 
                                    onPress={() => setSelectedColor(color)}
                                >
                                    {selectedColor === color && <CheckCircle2 color="white" size={20} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <TouchableOpacity 
                            style={[
                                styles.saveButton, 
                                { backgroundColor: title.trim().length > 0 ? appColors.primary : appColors.subText + '40' },
                                title.trim().length > 0 && { shadowColor: appColors.primary }
                            ]} 
                            onPress={handleSave}
                            disabled={title.trim().length === 0}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.saveButtonText,
                                title.trim().length === 0 && { opacity: 0.7 }
                            ]}>
                                Hedefi Oluştur ✨
                            </Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    backBtn: {
        padding: 5,
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 15,
    },
    input: {
        padding: 16,
        borderRadius: 14,
        fontSize: 18,
        fontWeight: '600',
    },
    frequencyContainer: {
        flexDirection: 'row',
        borderRadius: 14,
        padding: 4,
    },
    freqOption: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    freqText: {
        fontSize: 14,
        fontWeight: '500',
    },
    daysGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    dayButton: {
        width: 40,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 12,
        fontWeight: '600',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    colorOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: 'rgba(0,0,0,0.1)',
        transform: [{ scale: 1.1 }],
    },
    saveButton: {
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    suggestionsContainer: {
        marginBottom: 25,
    },
    suggestionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 5,
        gap: 10,
    },
    sparkleIcon: {
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionsTitle: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.2,
    },
    suggestionsScroll: {
        overflow: 'visible',
    },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        width: 280,
        overflow: 'hidden',
        position: 'relative',
    },
    suggestionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        zIndex: 1,
    },
    suggestionInfo: {
        flex: 1,
        marginRight: 8,
        zIndex: 1,
    },
    suggestionText: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 3,
    },
    suggestionReason: {
        fontSize: 11,
        lineHeight: 14,
        fontWeight: '500',
        opacity: 0.7,
    },
    addIconBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    }
});

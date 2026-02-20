import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Platform, ScrollView } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabits } from '../context/HabitContext';
import { colors } from '../constants/colors';
import { Moon, Sun, Bell, Palette, ChevronRight, LogOut, User, Zap, GraduationCap, ShieldCheck, HelpCircle, Camera, Check, X, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Modal, Image } from 'react-native';

export const SettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { userProfile, updateUserProfile, colors: appColors, resetData } = useHabits();
  const [showPrivacy, setShowPrivacy] = useState(false);

  const toggleTheme = () => {
    if (!userProfile) return;
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(userProfile.theme || 'system');
    const nextIndex = (currentIndex + 1) % themes.length;
    updateUserProfile({ ...userProfile, theme: themes[nextIndex] });
  };

  const setAccent = (color: string) => {
    if (!userProfile) return;
    updateUserProfile({ ...userProfile, accentColor: color });
  };

  const ACCENT_OPTIONS = ['#6C63FF', '#FF6584', '#00B894', '#0984E3', '#FDCB6E', '#E17055', '#D63031', '#2D3436'];

  const handleNotificationChange = (index: number) => {
    Alert.alert(
      "Bildirim Saati",
      "Hatırlatıcı saatini seçin",
      [
        { text: "08:00", onPress: () => updateTime(8, 0, index) },
        { text: "09:00", onPress: () => updateTime(9, 0, index) },
        { text: "12:00", onPress: () => updateTime(12, 0, index) },
        { text: "20:00", onPress: () => updateTime(20, 0, index) },
        index !== -1 ? { text: "Sil", style: 'destructive', onPress: () => removeTime(index) } : { text: "Vazgeç", style: "cancel" },
        { text: "Vazgeç", style: "cancel" }
      ]
    );
  };

  const updateTime = async (hour: number, minute: number, index: number) => {
    if (!userProfile) return;
    
    let newTimes = [...userProfile.notificationSettings.times];
    if (index === -1) {
        newTimes.push({ hour, minute });
    } else {
        newTimes[index] = { hour, minute };
    }

    updateUserProfile({ ...userProfile, notificationSettings: { ...userProfile.notificationSettings, times: newTimes } });
  };

  const handlePickAvatar = async () => {
    if (!userProfile) return;
    
    Alert.alert(
        "Avatarı Güncelle",
        "Yeni bir fotoğraf çekmek mi istersin yoksa galeriden mi seçmek?",
        [
            { text: "Kamera", onPress: handleTakePhoto },
            { text: "Galeri", onPress: handlePickImage },
            { text: "Vazgeç", style: "cancel" }
        ]
    );
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && userProfile) {
      updateUserProfile({ ...userProfile, photoUri: result.assets[0].uri, avatar: '' });
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

    if (!result.canceled && userProfile) {
      updateUserProfile({ ...userProfile, photoUri: result.assets[0].uri, avatar: '' });
    }
  };

  const removeTime = (index: number) => {
      if (!userProfile) return;
      const newTimes = userProfile.notificationSettings.times.filter((_, i) => i !== index);
      updateUserProfile({ ...userProfile, notificationSettings: { ...userProfile.notificationSettings, times: newTimes } });
  };


  const handleReset = () => {
    Alert.alert(
      "Sıfırla",
      "Tüm verileri silmek istediğine emin misin? Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Sıfırla", 
          style: "destructive", 
          onPress: async () => {
            if (userProfile && resetData) {
                await resetData();
                navigation.reset({ index: 0, routes: [{ name: 'Welcome' as never }] });
            }
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, showSwitch, switchValue, danger }: any) => (
    <TouchableOpacity 
      style={[styles.settingItem, { backgroundColor: appColors.card }]} 
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: danger ? '#FFEBEE' : appColors.primary + '15' }]}>
          <Icon size={20} color={danger ? '#D63031' : appColors.primary} />
        </View>
        <Text style={[styles.settingLabel, { color: danger ? '#D63031' : appColors.text }]}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value ? <Text style={[styles.settingValue, { color: appColors.subText }]}>{value}</Text> : null}
        {showSwitch ? (
          <Switch 
            value={switchValue} 
            onValueChange={onPress}
            trackColor={{ false: '#767577', true: appColors.primary + '80' }}
            thumbColor={switchValue ? appColors.primary : '#f4f3f4'}
          />
        ) : (
          <ChevronRight size={20} color={appColors.subText} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
          colors={appColors.backgroundGradient as string[]}
          style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headerTitle, { color: appColors.text }]}>Ayarlar</Text>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: appColors.card }]}>
            <LinearGradient
                colors={[appColors.primary, appColors.secondary || '#6C63FF']}
                start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                style={styles.profileGradient}
            />
            <View style={styles.profileContent}>
                <TouchableOpacity 
                    activeOpacity={0.8}
                    style={styles.avatarContainer}
                    onPress={handlePickAvatar}
                >
                    {userProfile?.photoUri ? (
                        <Image source={{ uri: userProfile.photoUri }} style={styles.fullAvatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{userProfile?.avatar || '👤'}</Text>
                    )}
                    <View style={[styles.editBadge, { backgroundColor: appColors.primary }]}>
                        <Camera size={10} color="white" />
                    </View>
                </TouchableOpacity>
                <View>
                    <Text style={styles.profileName}>
                        {userProfile?.name ? (userProfile.name.charAt(0).toUpperCase() + userProfile.name.slice(1)) : 'Misafir'}
                    </Text>
                    <Text style={styles.profileStatus}>{userProfile?.isStudent ? 'Öğrenci Modu Aktif 🎓' : 'Premium Üye ✨'}</Text>
                </View>
            </View>
        </View>

        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: appColors.subText }]}>Görünüm & Tema</Text>
            <SettingItem 
                icon={userProfile?.theme === 'dark' ? Moon : (userProfile?.theme === 'light' ? Sun : Palette)} 
                label={`Tema: ${userProfile?.theme === 'system' ? 'Sistem' : (userProfile?.theme === 'dark' ? 'Koyu' : 'Aydınlık')}`}
                onPress={toggleTheme}
            />
            
            <View style={[styles.accentCard, { backgroundColor: appColors.card }]}>
                <View style={styles.accentHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: appColors.primary + '15' }]}>
                        <Palette size={20} color={appColors.primary} />
                    </View>
                    <Text style={[styles.settingLabel, { color: appColors.text }]}>Vurgu Rengi</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                    {ACCENT_OPTIONS.map(color => (
                        <TouchableOpacity 
                            key={color} 
                            style={[
                                styles.colorOption, 
                                { backgroundColor: color }, 
                                userProfile?.accentColor === color && styles.selectedColorOption
                            ]} 
                            onPress={() => setAccent(color)}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>

        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: appColors.subText }]}>Bildirimler</Text>
            <SettingItem 
                icon={Bell}
                label="Bildirimleri Aç"
                showSwitch={true}
                switchValue={userProfile?.notificationSettings.enabled}
                onPress={() => {
                    if(!userProfile) return;
                    updateUserProfile({ ...userProfile, notificationSettings: { ...userProfile.notificationSettings, enabled: !userProfile.notificationSettings.enabled } });
                }}
            />
            <SettingItem 
                icon={Zap}
                label="Akıllı Öğrenme Modu"
                showSwitch={true}
                switchValue={userProfile?.notificationSettings.smartFrequency}
                onPress={() => {
                    if(!userProfile) return;
                    updateUserProfile({ 
                      ...userProfile, 
                      notificationSettings: { ...userProfile.notificationSettings, smartFrequency: !userProfile.notificationSettings.smartFrequency } 
                    });
                }}
            />
            
            {userProfile?.notificationSettings.enabled && (
                <>
                    {userProfile.notificationSettings.times.map((time, index) => (
                        <SettingItem 
                            key={index}
                            icon={Bell} 
                            label={`${index + 1}. Hatırlatıcı`} 
                            value={`${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`}
                            onPress={() => handleNotificationChange(index)}
                        />
                    ))}
                    <TouchableOpacity 
                        style={[styles.addTimeButton, { borderColor: appColors.primary }]}
                        onPress={() => handleNotificationChange(-1)}
                    >
                        <Text style={{ color: appColors.primary, fontWeight: '700' }}>+ Yeni Saat Ekle</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>

        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: appColors.subText }]}>Uygulama Ayarları</Text>
            <SettingItem 
                icon={GraduationCap} 
                label="Öğrenci Modu" 
                showSwitch={true}
                switchValue={userProfile?.isStudent}
                onPress={() => {
                    if(!userProfile) return;
                    updateUserProfile({ ...userProfile, isStudent: !userProfile.isStudent });
                }}
            />
             <SettingItem 
                icon={ShieldCheck} 
                label="Gizlilik Politikası" 
                onPress={() => setShowPrivacy(true)}
            />
            <SettingItem 
                icon={LogOut} 
                label="Verileri Sıfırla" 
                onPress={handleReset}
                danger
            />
             <SettingItem 
                icon={Activity} 
                label="Geliştirici Konsolu" 
                onPress={() => navigation.navigate('Debug')}
            />
        </View>

        <Text style={[styles.footerText, { color: appColors.subText }]}>HedefimBugün v1.2.0 • Made with ❤️</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal visible={showPrivacy} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: appColors.card }]}>
                  <View style={styles.modalHeader}>
                      <Text style={[styles.modalTitle, { color: appColors.text }]}>Gizlilik Politikası</Text>
                      <TouchableOpacity onPress={() => setShowPrivacy(false)}>
                          <X size={24} color={appColors.text} />
                      </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalScroll}>
                      <Text style={[styles.privacyText, { color: appColors.text }]}>
                          <Text style={styles.privacyBold}>HedefimBugün</Text> olarak gizliliğinize en üst düzeyde önem veriyoruz. Uygulamamız tamamen kullanıcı odaklı ve yerel veri koruma prensibiyle tasarlanmıştır.{"\n\n"}
                          
                          <Text style={styles.privacySection}>1. Veri Depolama ve Güvenlik</Text>{"\n"}
                          Tüm verileriniz (hedefleriniz, sınav bilgileriniz, profil ayarlarınız) sadece cihazınızda yerel olarak (AsyncStorage) saklanır. Hiçbir kişisel veriniz, hedefiniz veya ilerleme durumunuz sunucularımıza gönderilmez veya herhangi bir bulut sisteminde yedeklenmez. Uygulamayı sildiğinizde, tüm verileriniz kalıcı olarak cihazınızdan kaldırılır.{"\n\n"}
                          
                          <Text style={styles.privacySection}>2. Profil Fotoğrafları ve Galeri Erişimi</Text>{"\n"}
                          Seçtiğiniz profil fotoğrafları veya kamera ile çektiğiniz görseller sadece cihazınızın yerel depolama alanında tutulur. Bu görsellere erişimimiz yoktur ve herhangi bir platformda paylaşılmaz.{"\n\n"}
                          
                          <Text style={styles.privacySection}>3. Analitik ve İzleme</Text>{"\n"}
                          Uygulama içinde herhangi bir reklam, izleme (tracking) veya üçüncü taraf analitik aracı bulunmamaktadır. Kullanım verileriniz tamamen gizli kalır.{"\n\n"}
                          
                          <Text style={styles.privacySection}>4. Üçüncü Taraf Erişimi</Text>{"\n"}
                          Verileriniz asla satılmaz, kiralanmaz veya herhangi bir üçüncü taraf ile paylaşılmaz. Uygulama, cihazınızın yerel bildirim servislerini (Expo Notifications) kullanarak size hatırlatma yapar, bu veriler Expo sunucularında değil cihazınızın kendi bildirim motorunda işlenir.{"\n\n"}
                          
                          <Text style={styles.privacySection}>Sonuç</Text>{"\n"}
                          <Text style={styles.privacyBold}>HedefimBugün</Text>, %100 yerel ve güvenli bir kişisel asistan deneyimi sunar. Hedefleriniz sadece sizin gözünüzün önünde ve kontrolünüzdedir.
                      </Text>
                  </ScrollView>
                  <TouchableOpacity 
                    style={[styles.modalCloseButton, { backgroundColor: appColors.primary }]}
                    onPress={() => setShowPrivacy(false)}
                  >
                      <Text style={styles.modalCloseButtonText}>Anladım</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 20,
  },
  profileCard: {
    borderRadius: 24,
    height: 120,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  profileGradient: {
      ...StyleSheet.absoluteFillObject,
  },
  profileContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
  },
  avatarContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
      fontSize: 30,
  },
  profileName: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 4,
  },
  profileStatus: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      fontWeight: '600',
  },
  sectionContainer: {
      marginBottom: 30,
  },
  sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
      marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  accentCard: {
      borderRadius: 18,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 5,
      elevation: 2,
  },
  accentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  colorScroll: {
      flexGrow: 0,
  },
  colorOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
  },
  selectedColorOption: {
      borderWidth: 3,
      borderColor: 'rgba(0,0,0,0.2)',
      transform: [{ scale: 1.1 }],
  },
  addTimeButton: {
      padding: 14,
      borderRadius: 16,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      alignItems: 'center',
      marginTop: 5,
  },
  footerText: {
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '500',
      marginTop: 10,
      marginBottom: 20,
  },
  editBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'white',
  },
  fullAvatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 32,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
  },
  modalContent: {
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      maxHeight: '80%',
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  modalTitle: {
      fontSize: 22,
      fontWeight: '800',
  },
  modalScroll: {
      marginBottom: 20,
  },
  privacyText: {
      fontSize: 15,
      lineHeight: 24,
      opacity: 0.9,
  },
  privacyBold: {
      fontWeight: '800',
  },
  privacySection: {
      fontWeight: '800',
      fontSize: 17,
      marginTop: 15,
      display: 'flex',
  },
  modalCloseButton: {
      height: 56,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
  },
  modalCloseButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
  }
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const userProfile = {
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '+33 6 12 34 56 78',
    level: 8,
    experience: '5 ans',
    specializations: ['Urgences', 'Cardiologie', 'Pédiatrie'],
    rating: 4.8,
    missionsCompleted: 127,
    streak: 12,
    rank: 'Expert',
    achievements: [
      { id: 1, name: 'Première mission', icon: 'star', unlocked: true },
      { id: 2, name: 'Expert Urgences', icon: 'flash', unlocked: true },
      { id: 3, name: '100 missions', icon: 'trophy', unlocked: true },
      { id: 4, name: 'Streak 30 jours', icon: 'flame', unlocked: false },
    ],
  };

  const settingsSections = [
    {
      title: 'Compte',
      items: [
        { id: 'profile', title: 'Modifier le profil', icon: 'person-outline', action: () => navigation.navigate('EditProfile' as never) },
        { id: 'availability', title: 'Gérer disponibilités', icon: 'calendar-outline', action: () => navigation.navigate('Availability' as never) },
        { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', action: () => Alert.alert('Notifications', 'Page des notifications') },
        { id: 'privacy', title: 'Confidentialité', icon: 'shield-outline', action: () => Alert.alert('Confidentialité', 'Page de confidentialité') },
      ]
    },
    {
      title: 'Préférences',
      items: [
        { id: 'preferences', title: 'Préférences missions', icon: 'settings-outline', action: () => navigation.navigate('Settings' as never) },
        { id: 'location', title: 'Zone géographique', icon: 'location-outline', action: () => Alert.alert('Zone géographique', 'Gérer votre zone de recherche') },
        { id: 'language', title: 'Langue', icon: 'language-outline', action: () => Alert.alert('Langue', 'Choisir la langue') },
        { id: 'theme', title: 'Thème', icon: 'color-palette-outline', action: () => Alert.alert('Thème', 'Choisir le thème') },
      ]
    },
    {
      title: 'Support',
      items: [
        { id: 'help', title: 'Aide & Support', icon: 'help-circle-outline', action: () => navigation.navigate('Help' as never) },
        { id: 'feedback', title: 'Donner un avis', icon: 'chatbubble-outline', action: () => Alert.alert('Avis', 'Donner votre avis') },
        { id: 'about', title: 'À propos', icon: 'information-circle-outline', action: () => Alert.alert('À propos', 'Version 1.0.0 - NurseLinkAI') },
      ]
    }
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <Text style={styles.headerTitle}>Profil</Text>
      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings' as never)}>
        <Ionicons name="settings-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  const renderProfileCard = () => (
    <View style={styles.profileCard}>
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        style={styles.profileGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </Text>
      </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userProfile.level}</Text>
      </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileRank}>{userProfile.rank}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>{userProfile.rating}</Text>
              <Text style={styles.missionsText}>• {userProfile.missionsCompleted} missions</Text>
        </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userProfile.streak}</Text>
          <Text style={styles.statLabel}>Jours consécutifs</Text>
          </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userProfile.experience}</Text>
          <Text style={styles.statLabel}>Expérience</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userProfile.specializations.length}</Text>
          <Text style={styles.statLabel}>Spécialisations</Text>
        </View>
      </View>
    </View>
  );

  const renderGamification = () => (
    <View style={styles.gamificationCard}>
      <Text style={styles.sectionTitle}>Progression</Text>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Niveau {userProfile.level}</Text>
          <Text style={styles.progressSubtitle}>Niveau {userProfile.level + 1}</Text>
            </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={[styles.progressFill, { width: '75%' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          </View>
        <Text style={styles.progressText}>75% vers le niveau suivant</Text>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.achievementsTitle}>Réalisations</Text>
        <View style={styles.achievementsGrid}>
          {userProfile.achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={[
                styles.achievementIcon,
                { backgroundColor: achievement.unlocked ? '#10b981' : '#e5e7eb' }
              ]}>
                <Ionicons
                  name={achievement.icon as any}
                  size={20}
                  color={achievement.unlocked ? '#ffffff' : '#9ca3af'}
                />
              </View>
              <Text style={[
                styles.achievementText,
                { color: achievement.unlocked ? '#1f2937' : '#9ca3af' }
              ]}>
                {achievement.name}
              </Text>
            </View>
          ))}
          </View>
      </View>
    </View>
  );

  const renderAvailabilityButton = () => (
    <TouchableOpacity
      style={styles.availabilityButton}
      onPress={() => navigation.navigate('Availability' as never)}
    >
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.availabilityButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="calendar" size={20} color="#ffffff" />
        <Text style={styles.availabilityButtonText}>Gérer mes disponibilités</Text>
        <Ionicons name="chevron-forward" size={20} color="#ffffff" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSettings = () => (
      <View style={styles.settingsContainer}>
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingsItem}
              onPress={item.action}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons name={item.icon as any} size={20} color="#6b7280" />
                <Text style={styles.settingsItemTitle}>{item.title}</Text>
            </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );

  const renderAvailabilityModal = () => (
    <Modal
      visible={showAvailabilityModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowAvailabilityModal(false)}
          >
            <Ionicons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
          <Text style={styles.modalTitle}>Mes disponibilités</Text>
          <TouchableOpacity
            style={styles.modalSaveButton}
            onPress={() => {
              setShowAvailabilityModal(false);
              Alert.alert('Succès', 'Vos disponibilités ont été mises à jour');
            }}
          >
            <Text style={styles.modalSaveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
            </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.calendarContainer}>
            <Text style={styles.calendarTitle}>Calendrier des disponibilités</Text>
            <Text style={styles.calendarSubtitle}>
              Sélectionnez vos jours et créneaux disponibles
            </Text>

            {/* Placeholder pour un calendrier moderne */}
            <View style={styles.calendarPlaceholder}>
              <Ionicons name="calendar" size={64} color="#e5e7eb" />
              <Text style={styles.calendarPlaceholderText}>
                Calendrier interactif moderne
              </Text>
              <Text style={styles.calendarPlaceholderSubtext}>
                Sélectionnez vos disponibilités par jour et créneau
              </Text>
            </View>

            <View style={styles.availabilityTypes}>
              <Text style={styles.availabilityTypesTitle}>Types de disponibilité</Text>
              <View style={styles.availabilityTypeItem}>
                <View style={[styles.availabilityDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.availabilityTypeText}>Disponible</Text>
            </View>
              <View style={styles.availabilityTypeItem}>
                <View style={[styles.availabilityDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.availabilityTypeText}>Partiellement disponible</Text>
            </View>
              <View style={styles.availabilityTypeItem}>
                <View style={[styles.availabilityDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.availabilityTypeText}>Indisponible</Text>
            </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
        {renderHeader()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderProfileCard()}
        {renderGamification()}
        {renderAvailabilityButton()}
        {renderSettings()}
      </ScrollView>
      {renderAvailabilityModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#2563eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  profileCard: {
    margin: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileRank: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  missionsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  profileStats: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  gamificationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  achievementsSection: {
    marginTop: 16,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    alignItems: 'center',
    width: '45%',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  availabilityButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  availabilityButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
  },
  availabilityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginLeft: 12,
  },
  settingsContainer: {
    marginHorizontal: 20,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemTitle: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  modalSaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
  },
  calendarContainer: {
    padding: 20,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  calendarSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  calendarPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginBottom: 24,
  },
  calendarPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  calendarPlaceholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  availabilityTypes: {
    marginTop: 16,
  },
  availabilityTypesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  availabilityTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  availabilityTypeText: {
    fontSize: 14,
    color: '#1f2937',
  },
});

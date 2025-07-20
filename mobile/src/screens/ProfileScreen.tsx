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
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { useAppTheme } from '../theme';

const fakeProfile = {
  name: 'Emma Dubois',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  level: 5,
  xp: 1250,
  nextLevel: 2000,
  badges: [
    { icon: 'star', label: 'Expert Urgences' },
    { icon: 'medal', label: 'Streak 7j' },
    { icon: 'trophy', label: 'Top 10%' },
  ],
  stats: [
    { label: 'Missions', value: 24, icon: 'checkmark-circle' },
    { label: 'Gains', value: '2840€', icon: 'cash' },
    { label: 'Note', value: '4.9', icon: 'star' },
  ],
  availability: 'Disponible',
  streak: 7,
  rank: 'Expert',
  experience: '5 ans',
  rating: 4.8,
  missionsCompleted: 127,
  totalEarnings: '2840€',
};

export default function ProfileScreen() {
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const navigation = useNavigation();
  const theme = useAppTheme();

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
        { id: 'profile', title: 'Modifier le profil', icon: 'person-outline', action: () => {} },
        { id: 'availability', title: 'Gérer disponibilités', icon: 'calendar-outline', action: () => setShowAvailabilityModal(true) },
        { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', action: () => Alert.alert('Notifications', 'Page des notifications') },
        { id: 'privacy', title: 'Confidentialité', icon: 'shield-outline', action: () => Alert.alert('Confidentialité', 'Page de confidentialité') },
      ]
    },
    {
      title: 'Préférences',
      items: [
        { id: 'preferences', title: 'Préférences missions', icon: 'settings-outline', action: () => {} },
        { id: 'location', title: 'Zone géographique', icon: 'location-outline', action: () => Alert.alert('Zone géographique', 'Gérer votre zone de recherche') },
        { id: 'language', title: 'Langue', icon: 'language-outline', action: () => Alert.alert('Langue', 'Choisir la langue') },
        { id: 'theme', title: 'Thème', icon: 'color-palette-outline', action: () => Alert.alert('Thème', 'Choisir le thème') },
      ]
    },
    {
      title: 'Support',
      items: [
        { id: 'help', title: 'Aide & Support', icon: 'help-circle-outline', action: () => {} },
        { id: 'feedback', title: 'Donner un avis', icon: 'chatbubble-outline', action: () => Alert.alert('Avis', 'Donner votre avis') },
        { id: 'about', title: 'À propos', icon: 'information-circle-outline', action: () => Alert.alert('À propos', 'Version 1.0.0 - NurseLinkAI') },
      ]
    }
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <Text style={styles.headerTitle}>Profil</Text>
      <TouchableOpacity style={styles.settingsButton} onPress={() => {}}>
        <Ionicons name="settings-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  const renderProfileCard = () => (
    <View style={[styles.profileCard, !isMobile && styles.profileCardDesktop]}>
      {/* Header avec avatar et infos principales */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: fakeProfile.avatar }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{fakeProfile.name}</Text>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          </View>
          <Text style={styles.specialization}>Infirmière • {fakeProfile.experience} d'expérience</Text>
          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.badgeText}>{fakeProfile.rating}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="flame" size={12} color="#f59e0b" />
              <Text style={styles.badgeText}>{fakeProfile.streak}j</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="trophy" size={12} color="#8b5cf6" />
              <Text style={styles.badgeText}>{fakeProfile.rank}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats principales */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{fakeProfile.missionsCompleted}</Text>
            <Text style={styles.statLabel}>Missions réalisées</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="cash" size={20} color="#f59e0b" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{fakeProfile.totalEarnings}</Text>
            <Text style={styles.statLabel}>Gains totaux</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
            <Ionicons name="star" size={20} color="#8b5cf6" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{fakeProfile.rating}</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
        </View>
      </View>

      {/* Bouton disponibilité */}
      <Button
        title="Mettre à jour mes disponibilités"
        onPress={() => setShowAvailabilityModal(true)}
        accessibilityLabel="Mettre à jour mes disponibilités"
        icon="calendar"
        size="large"
        style={{ marginTop: 16 }}
      />
    </View>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={[styles.settingsSection, !isMobile && styles.settingsSectionDesktop]}>
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
          <Button
            title="Fermer"
            onPress={() => setShowAvailabilityModal(false)}
            accessibilityLabel="Fermer la modale de disponibilités"
            size="small"
            style={{ marginRight: 8 }}
            variant="outline"
          />
          <Button
            title="Enregistrer"
            onPress={() => {
              setShowAvailabilityModal(false);
              Alert.alert('Succès', 'Vos disponibilités ont été mises à jour');
            }}
            accessibilityLabel="Enregistrer mes disponibilités"
            size="small"
            variant="primary"
          />
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {renderHeader()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 32, paddingTop: 8 }]}
      >
        <View style={{ marginBottom: 32 }}>{renderProfileCard()}</View>
        <View style={{ marginBottom: 32 }}>{renderSettings()}</View>
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileCardDesktop: {
    maxWidth: 500,
    alignSelf: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#2563eb',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  specialization: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  settingsContainer: {
    marginHorizontal: 20,
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsSectionDesktop: {
    maxWidth: 500,
    alignSelf: 'center',
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemTitle: {
    fontSize: 16,
    color: '#374151',
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  calendarContainer: {
    flex: 1,
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
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 24,
  },
  calendarPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  calendarPlaceholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  availabilityTypes: {
    marginTop: 20,
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
    color: '#374151',
  },
});

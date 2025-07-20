import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MissionCard from '../components/MissionCard';
import Button from '../components/Button';
import { useAppTheme } from '../theme';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [user] = useState({
    name: 'Emma',
    level: 5,
    available: true,
    rating: 4.9,
    streak: 7,
    experience: 1250,
    nextLevel: 2000,
    rank: 'Expert',
    achievements: 8,
    totalMissions: 24,
  });

  const [currentMission] = useState({
    id: 1,
    title: 'Mission : Nuit Urgences',
    location: 'Hôpital Lyon Sud',
    time: '22h00 - 06h00',
    hourlyRate: 32,
    status: 'En cours',
  });

  const [quickStats] = useState([
    { id: 1, label: 'Missions', value: '24', icon: 'checkmark-circle', color: '#10b981', progress: 100 },
    { id: 2, label: 'Gains', value: '2840€', icon: 'cash', color: '#f59e0b', progress: 75 },
    { id: 3, label: 'Note', value: '4.9', icon: 'star', color: '#f59e0b', progress: 98 },
  ]);

  const [upcomingMissions] = useState([
    {
      id: 1,
      title: 'Jour Urgences',
      establishment: 'CHU Lyon',
      location: 'Lyon, 69003',
      time: '08h00 - 16h00',
      hourlyRate: 28,
      matchScore: 95,
      urgency: 'high',
      bonus: '+10% bonus',
      shift: 'Jour',
      duration: '1 jour',
      specializations: ['Urgences'],
    },
    {
      id: 2,
      title: 'Nuit Réanimation',
      establishment: 'Hôpital Croix-Rousse',
      location: 'Lyon, 69004',
      time: '20h00 - 08h00',
      hourlyRate: 30,
      matchScore: 87,
      urgency: 'medium',
      bonus: '+5% bonus',
      shift: 'Nuit',
      duration: '1 nuit',
      specializations: ['Réanimation'],
    },
    {
      id: 3,
      title: 'Weekend Pédiatrie',
      establishment: 'Hôpital Femme-Mère-Enfant',
      location: 'Lyon, 69005',
      time: '08h00 - 20h00',
      hourlyRate: 26,
      matchScore: 92,
      urgency: 'low',
      bonus: null,
      shift: 'Jour',
      duration: '2 jours',
      specializations: ['Pédiatrie'],
    },
  ]);

  const [dailyChallenge] = useState({
    title: 'Défi quotidien',
    description: 'Accepter 2 missions aujourd\'hui',
    progress: 1,
    total: 2,
    reward: '50 XP + 10€ bonus',
  });

  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const navigation = useNavigation();
  const theme = useAppTheme();

  const handleMissionPress = (missionId: number) => {
    console.log('Mission pressée:', missionId);
  };

  const handleApplyMission = (missionId: number) => {
    console.log('Candidature pour mission:', missionId);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#2563eb', '#1d4ed8', '#1e40af']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      {/* Header principal */}
      <View style={styles.headerContent}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: user.available ? '#10b981' : '#ef4444' }]} />
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Nv.{user.level}</Text>
            </View>
          </View>
          <View style={styles.userText}>
            <Text style={styles.greeting}>Bonjour, {user.name} 👋</Text>
            <Text style={styles.userStatus}>
              {user.available ? 'Disponible' : 'Occupé'} • {user.rank}
            </Text>
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={14} color="#fbbf24" />
              <Text style={styles.streakText}>{user.streak} jours consécutifs</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#ffffff" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Barre de progression niveau */}
      <View style={styles.levelProgress}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>Niveau {user.level}</Text>
          <Text style={styles.experienceText}>{user.experience}/{user.nextLevel} XP</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(user.experience / user.nextLevel) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.nextLevelText}>Plus que {user.nextLevel - user.experience} XP pour le niveau {user.level + 1} !</Text>
      </View>

      {/* Carte mission en cours */}
      {currentMission && (
        <View style={styles.currentMissionCard}>
          <View style={styles.currentMissionHeader}>
            <View style={styles.currentMissionTitleContainer}>
              <Text style={styles.currentMissionTitle}>{currentMission.title}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{currentMission.status}</Text>
              </View>
            </View>
            <Ionicons name="time-outline" size={20} color="#6b7280" />
          </View>

          <View style={styles.currentMissionDetails}>
            <View style={styles.currentMissionDetail}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.currentMissionDetailText}>{currentMission.location}</Text>
            </View>
            <View style={styles.currentMissionDetail}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.currentMissionDetailText}>{currentMission.time}</Text>
            </View>
          </View>

          <View style={styles.currentMissionFooter}>
            <Text style={styles.hourlyRate}>{currentMission.hourlyRate}€/h</Text>
            <Button
              title="Voir la mission"
              onPress={() => {/* TODO: navigation vers le détail de la mission */}}
              accessibilityLabel="Voir la mission en cours"
              size="medium"
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
      )}
    </LinearGradient>
  );

  const renderDailyChallenge = () => (
    <View style={styles.dailyChallengeContainer}>
      <LinearGradient
        colors={['#fbbf24', '#f59e0b']}
        style={styles.dailyChallengeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.dailyChallengeHeader}>
          <Ionicons name="trophy" size={24} color="#ffffff" />
          <Text style={styles.dailyChallengeTitle}>{dailyChallenge.title}</Text>
      </View>
        <Text style={styles.dailyChallengeDescription}>{dailyChallenge.description}</Text>
        <View style={styles.dailyChallengeProgress}>
          <View style={styles.dailyChallengeProgressBar}>
            <View
              style={[
                styles.dailyChallengeProgressFill,
                { width: `${(dailyChallenge.progress / dailyChallenge.total) * 100}%` }
              ]}
            />
      </View>
          <Text style={styles.dailyChallengeProgressText}>
            {dailyChallenge.progress}/{dailyChallenge.total}
          </Text>
      </View>
        <Text style={styles.dailyChallengeReward}>🎁 {dailyChallenge.reward}</Text>
      </LinearGradient>
      </View>
  );

  const renderUpcomingMissions = () => (
    <View style={[styles.section, { alignItems: isMobile ? 'stretch' : 'center' }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isMobile ? {} : { fontSize: 22 }]}>Prochaines missions</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal={isMobile}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.missionsScrollContainer, isMobile ? {} : { justifyContent: 'center' }]}
      >
        {upcomingMissions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            mode="compact"
            onPress={() => handleMissionPress(mission.id)}
            onApply={() => handleApplyMission(mission.id)}
            showBonus={true}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32, paddingTop: 8 }]}
      >
        {renderHeader()}
        <Button
          title="Voir mon profil"
          onPress={() => navigation.navigate('Profil' as never)}
          accessibilityLabel="Voir mon profil"
          size="large"
          style={{ alignSelf: 'center', marginVertical: 24 }}
        />
        <View style={{ marginBottom: 32 }}>
          {renderDailyChallenge()}
        </View>
        <View style={{ marginBottom: 32 }}>
          {renderUpcomingMissions()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  levelBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  userText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginLeft: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  levelProgress: {
    marginTop: 16,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  experienceText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  nextLevelText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  currentMissionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  currentMissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  currentMissionTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  currentMissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  currentMissionDetails: {
    marginBottom: 16,
  },
  currentMissionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentMissionDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  currentMissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourlyRate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  dailyChallengeContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  dailyChallengeCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dailyChallengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyChallengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  dailyChallengeDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 12,
  },
  dailyChallengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyChallengeProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  dailyChallengeProgressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  dailyChallengeProgressText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  dailyChallengeReward: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  missionsScrollContainer: {
    paddingRight: 20,
  },
});

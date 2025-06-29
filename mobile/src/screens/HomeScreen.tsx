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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
      location: 'CHU Lyon',
      time: '08h00 - 16h00',
      hourlyRate: 28,
      matchScore: 95,
      urgency: 'high',
      bonus: '+10% bonus',
    },
    {
      id: 2,
      title: 'Nuit Réanimation',
      location: 'Hôpital Croix-Rousse',
      time: '20h00 - 08h00',
      hourlyRate: 30,
      matchScore: 87,
      urgency: 'medium',
      bonus: '+5% bonus',
    },
    {
      id: 3,
      title: 'Weekend Pédiatrie',
      location: 'Hôpital Femme-Mère-Enfant',
      time: '08h00 - 20h00',
      hourlyRate: 26,
      matchScore: 92,
      urgency: 'low',
      bonus: null,
    },
  ]);

  const [dailyChallenge] = useState({
    title: 'Défi du jour',
    description: 'Compléter 2 missions',
    progress: 1,
    total: 2,
    reward: '50 XP + 10€ bonus',
    completed: false,
  });

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
            <TouchableOpacity style={styles.viewMissionButton}>
              <Text style={styles.viewMissionButtonText}>Voir la mission</Text>
            </TouchableOpacity>
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

  const renderMainAction = () => (
    <View style={styles.mainActionContainer}>
      <TouchableOpacity style={styles.mainActionButton}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.mainActionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="search" size={24} color="#ffffff" />
          <Text style={styles.mainActionText}>TROUVER UNE MISSION</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      {quickStats.map((stat) => (
        <View key={stat.id} style={styles.quickStatCard}>
          <View style={[styles.quickStatIcon, { backgroundColor: stat.color + '20' }]}>
            <Ionicons name={stat.icon} size={20} color={stat.color} />
          </View>
          <Text style={styles.quickStatValue}>{stat.value}</Text>
          <Text style={styles.quickStatLabel}>{stat.label}</Text>
          <View style={styles.quickStatProgress}>
            <View
              style={[
                styles.quickStatProgressFill,
                { width: `${stat.progress}%`, backgroundColor: stat.color }
              ]}
            />
            </View>
              </View>
        ))}
    </View>
  );

  const renderUpcomingMissions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Prochaines missions</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.missionsScrollContainer}
      >
        {upcomingMissions.map((mission) => (
        <TouchableOpacity key={mission.id} style={styles.missionCard}>
            <View style={styles.missionCardHeader}>
              <Text style={styles.missionCardTitle}>{mission.title}</Text>
              <View style={[
                styles.urgencyBadge,
                {
                  backgroundColor: mission.urgency === 'high' ? '#ef4444' :
                                 mission.urgency === 'medium' ? '#f59e0b' : '#10b981'
                }
              ]}>
                <Text style={styles.urgencyBadgeText}>
                  {mission.urgency === 'high' ? 'Urgent' :
                   mission.urgency === 'medium' ? 'Modéré' : 'Normal'}
                </Text>
              </View>
            </View>

            <View style={styles.missionCardDetails}>
              <View style={styles.missionCardDetail}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.missionCardDetailText}>{mission.location}</Text>
            </View>
              <View style={styles.missionCardDetail}>
                <Ionicons name="time-outline" size={14} color="#6b7280" />
                <Text style={styles.missionCardDetailText}>{mission.time}</Text>
          </View>
            </View>

            <View style={styles.missionCardFooter}>
              <Text style={styles.missionCardRate}>{mission.hourlyRate}€/h</Text>
              <View style={styles.matchScoreContainer}>
                <Text style={styles.matchScoreText}>{mission.matchScore}%</Text>
              </View>
          </View>

            {mission.bonus && (
              <View style={styles.bonusContainer}>
                <Ionicons name="gift" size={12} color="#f59e0b" />
                <Text style={styles.bonusText}>{mission.bonus}</Text>
          </View>
            )}
        </TouchableOpacity>
      ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderDailyChallenge()}
        {renderMainAction()}
        {renderQuickStats()}
        {renderUpcomingMissions()}
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
    paddingBottom: 100, // Espace pour la tab bar
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
  viewMissionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewMissionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
  mainActionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mainActionButton: {
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mainActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  mainActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 6,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  quickStatProgress: {
    width: '100%',
    height: 3,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  quickStatProgressFill: {
    height: '100%',
    borderRadius: 2,
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
  missionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginRight: 12,
    borderRadius: 16,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  missionCardHeader: {
    marginBottom: 12,
  },
  missionCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  missionCardDetails: {
    marginBottom: 12,
  },
  missionCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  missionCardDetailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  missionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionCardRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  matchScoreContainer: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bonusText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 4,
  },
});

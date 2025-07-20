import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MissionCard from '../components/MissionCard';
import ScreenHeader from '../components/ScreenHeader';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Mission parfaite pour vous !',
      message: 'Une mission correspond parfaitement à votre profil',
      time: 'Il y a 5 min',
      read: false,
      mission: {
        id: 1,
        title: 'Infirmier Urgences - Nuit',
        establishment: 'Hôpital Edouard Herriot',
        location: 'Lyon, 69000',
        distance: '2.3km',
        hourlyRate: 32,
        shift: 'Nuit',
        duration: '3 jours',
        matchScore: 95,
        urgency: 'high',
        specializations: ['Urgences', 'Réanimation'],
      },
    },
    {
      id: 2,
      title: 'Nouvelle opportunité',
      message: 'Une mission dans votre zone de prédilection',
      time: 'Il y a 15 min',
      read: false,
      mission: {
        id: 2,
        title: 'IDE Cardiologie - Jour',
        establishment: 'Clinique du Cœur',
        location: 'Lyon, 69008',
        distance: '4.1km',
        hourlyRate: 28,
        shift: 'Jour',
        duration: '1 semaine',
        matchScore: 87,
        urgency: 'medium',
        specializations: ['Cardiologie', 'Soins intensifs'],
      },
    },
    {
      id: 3,
      title: 'Mission urgente disponible',
      message: 'Une mission urgente correspond à vos compétences',
      time: 'Il y a 30 min',
      read: true,
      mission: {
        id: 3,
        title: 'Infirmier Pédiatrie - Weekend',
        establishment: 'Hôpital Femme-Mère-Enfant',
        location: 'Lyon, 69005',
        distance: '1.8km',
        hourlyRate: 26,
        shift: 'Jour',
        duration: '2 semaines',
        matchScore: 92,
        urgency: 'low',
        specializations: ['Pédiatrie', 'Néonatologie'],
      },
    },
  ]);

  const handleAcceptMission = (missionId: number, matchScore: number) => {
    console.log('Mission acceptée:', missionId, 'Match score:', matchScore);
    // Marquer comme lue et retirer de la liste
    setNotifications(prev => prev.filter(n => n.mission.id !== missionId));
  };

  const handleDeclineMission = (missionId: number) => {
    console.log('Mission refusée:', missionId);
    // Marquer comme lue et retirer de la liste
    setNotifications(prev => prev.filter(n => n.mission.id !== missionId));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMissionPress = (missionId: number) => {
    console.log('Mission pressée:', missionId);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>Aucune mission à saisir</Text>
      <Text style={styles.emptyText}>
        Vous recevrez des notifications quand de nouvelles missions correspondront à votre profil
      </Text>
    </View>
  );

  const renderPerfectMatchCard = (notification: any) => (
    <View key={notification.id} style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationInfo}>
          <Ionicons name="heart" size={20} color="#ef4444" style={{ marginRight: 6 }} />
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>

      <Text style={styles.notificationMessage}>{notification.message}</Text>

      <View style={styles.missionCardContainer}>
        <MissionCard
          mission={notification.mission}
          mode="normal"
          onPress={() => handleMissionPress(notification.mission.id)}
          onAccept={() => handleAcceptMission(notification.mission.id, notification.mission.matchScore)}
          onDecline={() => handleDeclineMission(notification.mission.id)}
          showActions={true}
          showBonus={false}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Missions à saisir"
        onRightPress={handleMarkAllAsRead}
        rightText="Tout marquer lu"
      />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {notifications.length === 0 ? (
          renderEmptyState()
        ) : (
          notifications.map(renderPerfectMatchCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  missionCardContainer: {
    marginTop: 8,
  },
});

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

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'perfect-match',
      title: 'Mission parfaite pour vous !',
      message: 'Une mission correspond parfaitement à votre profil',
      time: 'Il y a 2h',
      read: false,
      mission: {
        id: 101,
        title: 'Infirmier Urgences - Nuit',
        establishment: 'Hôpital Edouard Herriot',
        location: 'Lyon, 69000',
        hourlyRate: 32,
        matchScore: 98,
        specializations: ['Urgences', 'Réanimation'],
        shift: 'Nuit',
        duration: '3 jours',
      }
    },
    {
      id: 2,
      type: 'perfect-match',
      title: 'Match exceptionnel !',
      message: 'Cette mission correspond à 95% à vos compétences',
      time: 'Il y a 4h',
      read: false,
      mission: {
        id: 102,
        title: 'IDE Cardiologie - Jour',
        establishment: 'Clinique du Cœur',
        location: 'Lyon, 69008',
        hourlyRate: 28,
        matchScore: 95,
        specializations: ['Cardiologie', 'Soins intensifs'],
        shift: 'Jour',
        duration: '1 semaine',
      }
    },
    {
      id: 3,
      type: 'perfect-match',
      title: 'Mission idéale disponible',
      message: 'Une opportunité qui correspond à votre expérience',
      time: 'Il y a 6h',
      read: true,
      mission: {
        id: 103,
        title: 'Infirmier Pédiatrie - Weekend',
        establishment: 'Hôpital Femme-Mère-Enfant',
        location: 'Lyon, 69005',
        hourlyRate: 26,
        matchScore: 92,
        specializations: ['Pédiatrie', 'Néonatologie'],
        shift: 'Jour',
        duration: '2 semaines',
      }
    },
    {
      id: 4,
      type: 'system',
      title: 'Profil mis à jour',
      message: 'Votre profil a été mis à jour avec succès',
      time: 'Il y a 1j',
      read: true,
    },
    {
      id: 5,
      type: 'system',
      title: 'Nouveau badge débloqué',
      message: 'Félicitations ! Vous avez débloqué le badge "Expert Urgences"',
      time: 'Il y a 2j',
      read: true,
    }
  ]);

  // Seuil de matching configurable (par défaut 80%)
  const [minMatchThreshold, setMinMatchThreshold] = useState(80);

  const handleAcceptMission = (missionId: number, matchScore: number) => {
    if (matchScore < minMatchThreshold) {
      Alert.alert(
        'Match faible',
        `Cette mission a un match de ${matchScore}% (seuil: ${minMatchThreshold}%). Voulez-vous quand même l'accepter ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Accepter quand même',
            style: 'default',
            onPress: () => acceptMission(missionId)
          }
        ]
      );
    } else {
      acceptMission(missionId);
    }
  };

  const acceptMission = (missionId: number) => {
    setNotifications(prev =>
      prev.filter(notif =>
        !(notif.type === 'perfect-match' && notif.mission?.id === missionId)
      )
    );
    Alert.alert('Succès', 'Mission acceptée ! Vous recevrez bientôt les détails.');
  };

  const handleDeclineMission = (missionId: number) => {
    Alert.alert(
      'Refuser la mission',
      'Êtes-vous sûr de vouloir refuser cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: () => {
            // Logique de refus
            setNotifications(prev =>
              prev.filter(notif =>
                !(notif.type === 'perfect-match' && notif.mission?.id === missionId)
              )
            );
            Alert.alert('Mission refusée', 'Nous vous proposerons d\'autres missions.');
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <Text style={styles.headerTitle}>Notifications</Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            Alert.prompt(
              'Seuil de matching',
              `Définissez le seuil minimum de matching (actuel: ${minMatchThreshold}%)`,
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'OK',
                  onPress: (value) => {
                    const newThreshold = parseInt(value || '80');
                    if (newThreshold >= 0 && newThreshold <= 100) {
                      setMinMatchThreshold(newThreshold);
                    }
                  }
                }
              ],
              'plain-text',
              minMatchThreshold.toString()
            );
          }}
        >
          <Ionicons name="settings-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Tout marquer lu</Text>
      </TouchableOpacity>
      </View>
    </View>
  );

  const renderPerfectMatchCard = (notification: any) => (
    <View key={notification.id} style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationInfo}>
          <View style={styles.notificationTitleRow}>
            <Ionicons name="heart" size={20} color="#ef4444" />
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            {!notification.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
              </View>

      <View style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <View style={styles.missionTitleContainer}>
            <Text style={styles.missionTitle}>{notification.mission.title}</Text>
            <View style={styles.matchScoreContainer}>
              <LinearGradient
                colors={
                  notification.mission.matchScore >= 90 ? ['#10b981', '#059669'] :
                  notification.mission.matchScore >= 80 ? ['#f59e0b', '#d97706'] :
                  ['#ef4444', '#dc2626']
                }
                style={[
                  styles.matchScoreBadge,
                  notification.mission.matchScore < minMatchThreshold && styles.matchScoreLow
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="star" size={10} color="#ffffff" />
                <Text style={styles.matchScoreBadgeText}>{notification.mission.matchScore}%</Text>
              </LinearGradient>
              {notification.mission.matchScore < minMatchThreshold && (
                <View style={styles.warningIcon}>
                  <Ionicons name="warning" size={12} color="#f59e0b" />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Explication du matching */}
        <View style={styles.matchingExplanation}>
          <Text style={styles.explanationTitle}>Pourquoi ce matching ?</Text>
          <View style={styles.explanationItems}>
            <View style={styles.explanationItem}>
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text style={styles.explanationText}>+15% : Spécialité parfaite</Text>
            </View>
            <View style={styles.explanationItem}>
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text style={styles.explanationText}>+10% : Proche de chez vous</Text>
            </View>
            <View style={styles.explanationItem}>
              <Ionicons name="close-circle" size={14} color="#ef4444" />
              <Text style={styles.explanationText}>-5% : Horaires non préférés</Text>
            </View>
      </View>
      </View>

        <Text style={styles.establishment}>{notification.mission.establishment}</Text>

        <View style={styles.missionDetails}>
          <View style={styles.missionDetail}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.missionDetailText}>{notification.mission.location}</Text>
      </View>
          <View style={styles.missionDetail}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.missionDetailText}>{notification.mission.shift} • {notification.mission.duration}</Text>
      </View>
    </View>

        <View style={styles.specializations}>
          {notification.mission.specializations.map((spec: string, index: number) => (
            <View key={index} style={styles.specTag}>
              <Text style={styles.specText}>{spec}</Text>
            </View>
          ))}
        </View>

        <View style={styles.missionFooter}>
          <Text style={styles.hourlyRate}>{notification.mission.hourlyRate}€/h</Text>
          <View style={styles.actionButtons}>
        <TouchableOpacity
              style={styles.declineButton}
              onPress={() => handleDeclineMission(notification.mission.id)}
        >
              <Text style={styles.declineButtonText}>Refuser</Text>
        </TouchableOpacity>
        <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleAcceptMission(notification.mission.id, notification.mission.matchScore)}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.acceptButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.acceptButtonText}>Accepter</Text>
              </LinearGradient>
        </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSystemNotification = (notification: any) => (
    <View key={notification.id} style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationInfo}>
          <View style={styles.notificationTitleRow}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            {!notification.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
      </View>
    </View>
  );

  const perfectMatches = notifications.filter(n => n.type === 'perfect-match');
  const systemNotifications = notifications.filter(n => n.type === 'system');

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsListContent}
      >
        {perfectMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Missions parfaites ({perfectMatches.length})</Text>
            {perfectMatches.map(renderPerfectMatchCard)}
          </View>
        )}

        {systemNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Autres notifications ({systemNotifications.length})</Text>
            {systemNotifications.map(renderSystemNotification)}
          </View>
        )}

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>Aucune notification</Text>
            <Text style={styles.emptyStateMessage}>
              Vous recevrez des notifications quand de nouvelles missions correspondront à votre profil
            </Text>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsListContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationHeader: {
    marginBottom: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  missionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  missionHeader: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  missionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  matchScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchScoreBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  matchScoreLow: {
    backgroundColor: '#f59e0b',
  },
  warningIcon: {
    marginLeft: 4,
    padding: 2,
    borderRadius: 6,
    backgroundColor: '#fef3c7',
  },
  establishment: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  missionDetails: {
    marginBottom: 12,
  },
  missionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  missionDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  specializations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  specTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  specText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourlyRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  declineButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  acceptButton: {
    borderRadius: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  matchingExplanation: {
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  explanationItems: {
    flexDirection: 'row',
    gap: 8,
  },
  explanationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  explanationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
});

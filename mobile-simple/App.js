import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [activeTab, setActiveTab] = useState('missions');
  
  const missions = [
    {
      id: 1,
      title: "Infirmier de nuit - CHU Lyon",
      location: "Lyon, 69003",
      hourlyRate: 28,
      urgency: "high",
      startDate: "2025-01-15",
      description: "Mission de remplacement en service des urgences pour équipe de nuit."
    },
    {
      id: 2,
      title: "Infirmier urgences - Villeurbanne",
      location: "Villeurbanne, 69100",
      hourlyRate: 25,
      urgency: "medium",
      startDate: "2025-01-18",
      description: "Renfort d'équipe pour service d'urgences pédiatriques."
    },
    {
      id: 3,
      title: "Infirmier réanimation - Hôpital Lyon Sud",
      location: "Pierre-Bénite, 69310",
      hourlyRate: 30,
      urgency: "high",
      startDate: "2025-01-20",
      description: "Mission en réanimation médicale, expérience requise."
    }
  ];

  const notifications = [
    {
      id: 1,
      title: "Candidature acceptée",
      message: "Votre candidature pour la mission CHU Lyon a été acceptée !",
      type: "success",
      time: "Il y a 2h"
    },
    {
      id: 2,
      title: "Nouvelle mission",
      message: "Une mission correspondant à votre profil est disponible à Villeurbanne",
      type: "info",
      time: "Il y a 4h"
    }
  ];

  const handleApplyToMission = (mission) => {
    Alert.alert(
      "Postuler à cette mission",
      `Voulez-vous postuler pour "${mission.title}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Postuler", 
          onPress: () => Alert.alert("Succès", "Candidature envoyée avec succès !") 
        }
      ]
    );
  };

  const renderMissionCard = (mission) => (
    <View key={mission.id} style={styles.missionCard}>
      <View style={styles.missionHeader}>
        <Text style={styles.missionTitle}>{mission.title}</Text>
        <View style={[
          styles.urgencyBadge,
          { backgroundColor: mission.urgency === 'high' ? '#ef4444' : '#f59e0b' }
        ]}>
          <Text style={styles.urgencyText}>
            {mission.urgency === 'high' ? 'Urgent' : 'Modéré'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.missionLocation}>📍 {mission.location}</Text>
      <Text style={styles.missionRate}>💰 {mission.hourlyRate}€/h</Text>
      <Text style={styles.missionDate}>🕐 Début: {mission.startDate}</Text>
      <Text style={styles.missionDescription}>{mission.description}</Text>
      
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => handleApplyToMission(mission)}
      >
        <Text style={styles.applyButtonText}>Postuler</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationCard = (notification) => (
    <View key={notification.id} style={[
      styles.notificationCard,
      { borderLeftColor: notification.type === 'success' ? '#10b981' : '#2563eb' }
    ]}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
      <Text style={styles.notificationMessage}>{notification.message}</Text>
    </View>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'missions':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Missions disponibles ({missions.length})</Text>
            {missions.map(renderMissionCard)}
          </View>
        );
      
      case 'notifications':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Notifications ({notifications.length})</Text>
            {notifications.map(renderNotificationCard)}
          </View>
        );
      
      case 'profile':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Mon Profil</Text>
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>Marie Dupont</Text>
              <Text style={styles.profileRole}>Infirmière Diplômée d'État</Text>
              <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>42</Text>
                  <Text style={styles.statLabel}>Missions</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>4.8/5</Text>
                  <Text style={styles.statLabel}>Note</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>5 ans</Text>
                  <Text style={styles.statLabel}>Expérience</Text>
                </View>
              </View>
              <View style={styles.specializations}>
                <Text style={styles.specializationTitle}>Spécialisations:</Text>
                <View style={styles.tags}>
                  <Text style={styles.tag}>Urgences</Text>
                  <Text style={styles.tag}>Réanimation</Text>
                  <Text style={styles.tag}>Soins intensifs</Text>
                </View>
              </View>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏥 NurseLink AI</Text>
        <Text style={styles.headerSubtitle}>Plateforme de missions médicales</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'missions' && styles.activeTab]}
          onPress={() => setActiveTab('missions')}
        >
          <Text style={[styles.tabText, activeTab === 'missions' && styles.activeTabText]}>
            💼 Missions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
            🔔 Notifications
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            👤 Profil
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e5e7eb',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  missionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgencyText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  missionLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  missionRate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  missionDate: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  applyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  specializations: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  specializationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '500',
  },
});
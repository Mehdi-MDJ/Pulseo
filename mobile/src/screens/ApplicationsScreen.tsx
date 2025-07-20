import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MissionCard from '../components/MissionCard';
import ScreenHeader from '../components/ScreenHeader';

const fakeApplications = [
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
    status: 'pending',
    appliedAt: '2024-01-15T10:30:00Z',
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
    status: 'accepted',
    appliedAt: '2024-01-14T15:45:00Z',
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
    status: 'rejected',
    appliedAt: '2024-01-13T09:15:00Z',
  },
  {
    id: 4,
    title: 'Garde Cardiologie',
    establishment: 'Hôpital Lyon Sud',
    location: 'Lyon, 69009',
    time: '18h00 - 08h00',
    hourlyRate: 32,
    matchScore: 89,
    urgency: 'high',
    bonus: '+15% bonus',
    shift: 'Nuit',
    duration: '1 nuit',
    specializations: ['Cardiologie'],
    status: 'pending',
    appliedAt: '2024-01-12T14:20:00Z',
  },
];

const statusConfig = {
  pending: {
    label: 'En attente',
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    icon: 'time-outline',
  },
  accepted: {
    label: 'Acceptée',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    icon: 'checkmark-circle',
  },
  rejected: {
    label: 'Refusée',
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    icon: 'close-circle',
  },
};

export default function ApplicationsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const filteredApplications = selectedFilter === 'all'
    ? fakeApplications
    : fakeApplications.filter(app => app.status === selectedFilter);

  const getStatusCount = (status: string) => {
    return fakeApplications.filter(app => app.status === status).length;
  };

  const handleMissionPress = (missionId: number) => {
    console.log('Mission pressée:', missionId);
  };

  const renderFilters = () => (
    <View style={[styles.filtersContainer, !isMobile && styles.filtersContainerDesktop]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === 'all' && styles.filterButtonTextActive
          ]}>
            Toutes ({fakeApplications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'pending' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('pending')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === 'pending' && styles.filterButtonTextActive
          ]}>
            En attente ({getStatusCount('pending')})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'accepted' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('accepted')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === 'accepted' && styles.filterButtonTextActive
          ]}>
            Acceptées ({getStatusCount('accepted')})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'rejected' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('rejected')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === 'rejected' && styles.filterButtonTextActive
          ]}>
            Refusées ({getStatusCount('rejected')})
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderApplicationCard = (application: any) => {
    const status = statusConfig[application.status as keyof typeof statusConfig];

    return (
      <View key={application.id} style={[styles.applicationCard, !isMobile && styles.applicationCardDesktop]}>
        <MissionCard
          mission={application}
          onPress={() => handleMissionPress(application.id)}
          compact={true}
        />

        <View style={styles.applicationFooter}>
          <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
            <Ionicons name={status.icon as any} size={16} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>

          <Text style={styles.appliedDate}>
            Postulé le {new Date(application.appliedAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyState, !isMobile && styles.emptyStateDesktop]}>
      <Ionicons name="document-text-outline" size={64} color="#e5e7eb" />
      <Text style={styles.emptyStateTitle}>
        {selectedFilter === 'all' ? 'Aucune candidature' : `Aucune candidature ${selectedFilter === 'pending' ? 'en attente' : selectedFilter === 'accepted' ? 'acceptée' : 'refusée'}`}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {selectedFilter === 'all'
          ? 'Vous n\'avez pas encore postulé à des missions'
          : selectedFilter === 'pending'
          ? 'Aucune candidature en attente de réponse'
          : selectedFilter === 'accepted'
          ? 'Aucune candidature acceptée pour le moment'
          : 'Aucune candidature refusée'
        }
      </Text>
      {selectedFilter === 'all' && (
        <TouchableOpacity style={styles.browseButton}>
          <Text style={styles.browseButtonText}>Parcourir les missions</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScreenHeader
        title="Mes candidatures"
        subtitle="Suivez vos candidatures"
        showBackButton={true}
      />

      {renderFilters()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {filteredApplications.length > 0 ? (
          filteredApplications.map(renderApplicationCard)
        ) : (
          renderEmptyState()
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
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersContainerDesktop: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  applicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  applicationCardDesktop: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  applicationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  appliedDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateDesktop: {
    maxWidth: 400,
    alignSelf: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

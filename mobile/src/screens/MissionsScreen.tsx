import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function MissionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const filters = [
    { id: 'all', label: 'Toutes', icon: 'grid-outline' },
    { id: 'urgent', label: 'Urgentes', icon: 'flash-outline' },
    { id: 'nearby', label: 'Proches', icon: 'location-outline' },
    { id: 'high-pay', label: 'Bien payées', icon: 'cash-outline' },
  ];

  const missions = [
    {
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
    {
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
    {
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
    {
      id: 4,
      title: 'IDE Réanimation - Nuit',
      establishment: 'CHU Lyon Sud',
      location: 'Pierre-Bénite, 69310',
      distance: '8.2km',
      hourlyRate: 30,
      shift: 'Nuit',
      duration: '5 jours',
      matchScore: 89,
      urgency: 'high',
      specializations: ['Réanimation', 'Soins intensifs'],
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Missions</Text>
        <View style={styles.headerStatus}>
          <View style={styles.connectionStatus}>
            <View style={styles.connectionDot} />
            <Text style={styles.connectionText}>En ligne</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#1f2937" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une mission..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterButton,
            activeFilter === filter.id && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter(filter.id)}
        >
          <Ionicons
            name={filter.icon as any}
            size={10}
            color={activeFilter === filter.id ? '#ffffff' : '#6b7280'}
          />
          <Text style={[
            styles.filterText,
            activeFilter === filter.id && styles.filterTextActive
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMissionCard = (mission: any) => (
    <TouchableOpacity key={mission.id} style={styles.missionCard}>
      <View style={styles.missionHeader}>
        <View style={styles.missionTitleContainer}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <View style={styles.matchScoreContainer}>
            <LinearGradient
              colors={mission.matchScore >= 90 ? ['#10b981', '#059669'] :
                     mission.matchScore >= 80 ? ['#f59e0b', '#d97706'] : ['#6b7280', '#4b5563']}
              style={styles.matchScoreBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="star" size={10} color="#ffffff" />
              <Text style={styles.matchScoreBadgeText}>{mission.matchScore}%</Text>
            </LinearGradient>
          </View>
        </View>
        {mission.urgency === 'high' && (
          <View style={styles.urgentIndicator}>
            <Ionicons name="flash" size={8} color="#ffffff" />
          </View>
        )}
      </View>

      <View style={styles.missionHeader}>
        <View style={styles.missionTitleContainer}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <View style={[
            styles.urgencyBadge,
            { backgroundColor: mission.urgency === 'high' ? '#ef4444' :
                             mission.urgency === 'medium' ? '#f59e0b' : '#10b981' }
          ]}>
            <Text style={styles.urgencyBadgeText}>
              {mission.urgency === 'high' ? 'Urgent' :
               mission.urgency === 'medium' ? 'Modéré' : 'Normal'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.establishment}>{mission.establishment}</Text>

      <View style={styles.missionDetails}>
        <View style={styles.missionDetail}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.missionDetailText}>{mission.location} • {mission.distance}</Text>
        </View>
        <View style={styles.missionDetail}>
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text style={styles.missionDetailText}>{mission.shift} • {mission.duration}</Text>
        </View>
      </View>

      <View style={styles.specializations}>
        {mission.specializations.map((spec: string, index: number) => (
          <View key={index} style={styles.specTag}>
            <Text style={styles.specText}>{spec}</Text>
          </View>
        ))}
      </View>

      <View style={styles.missionFooter}>
        <Text style={styles.hourlyRate}>{mission.hourlyRate}€/h</Text>
        <TouchableOpacity style={styles.applyButton}>
          <LinearGradient
            colors={['#2563eb', '#1d4ed8']}
            style={styles.applyButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.applyButtonText}>Postuler</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderLegend = () => (
    <View style={styles.legendContainer}>
      <Text style={styles.legendTitle}>Légende du matching :</Text>
      <View style={styles.legendItems}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Excellent (90%+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Bon (80-89%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#6b7280' }]} />
          <Text style={styles.legendText}>Moyen (&lt;80%)</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      {renderFilters()}
      <ScrollView
        style={styles.missionsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.missionsListContent}
      >
        {missions.map(renderMissionCard)}
      </ScrollView>
      {renderLegend()}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  connectionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
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
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 3,
    minWidth: 60,
    maxWidth: 80,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    marginLeft: 2,
    fontSize: 10,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  missionsList: {
    flex: 1,
  },
  missionsListContent: {
    padding: 20,
  },
  missionCard: {
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
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginTop: 4,
  },
  missionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgencyBadgeText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '600',
  },
  establishment: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  missionDetails: {
    marginBottom: 10,
  },
  missionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  missionDetailText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
  specializations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 3,
  },
  specText: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '500',
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  applyButton: {
    borderRadius: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  urgentIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  matchScoreContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matchScoreBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 3,
  },
  legendContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 20,
    height: 10,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});

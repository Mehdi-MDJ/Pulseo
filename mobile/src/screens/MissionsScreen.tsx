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
import MissionCard from '../components/MissionCard';
import ScreenHeader from '../components/ScreenHeader';

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
      establishment: 'CHU Lyon',
      location: 'Lyon, 69003',
      distance: '3.2km',
      hourlyRate: 35,
      shift: 'Nuit',
      duration: '1 mois',
      matchScore: 89,
      urgency: 'high',
      specializations: ['Réanimation', 'Soins critiques'],
    },
    {
      id: 5,
      title: 'Infirmier Chirurgie - Jour',
      establishment: 'Clinique de la Sauvegarde',
      location: 'Lyon, 69009',
      distance: '5.1km',
      hourlyRate: 30,
      shift: 'Jour',
      duration: '2 semaines',
      matchScore: 84,
      urgency: 'medium',
      specializations: ['Chirurgie', 'Bloc opératoire'],
    },
  ];

  const handleMissionPress = (missionId: number) => {
    // Navigation vers les détails de la mission
    console.log('Mission pressée:', missionId);
  };

  const handleApplyMission = (missionId: number) => {
    // Logique de candidature
    console.log('Candidature pour mission:', missionId);
  };

  const handleNotificationPress = () => {
    // Navigation vers les notifications
    console.log('Notifications pressées');
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une mission..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
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
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
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
              size={12}
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
    </View>
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
      <ScreenHeader
        title="Missions disponibles"
        onRightPress={handleNotificationPress}
        rightIcon="notifications-outline"
        showNotificationBadge={true}
        notificationCount={3}
      />
      {renderSearchBar()}
      {renderFilters()}
      <ScrollView
        style={styles.missionsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.missionsListContent}
      >
        {missions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            mode="normal"
            onPress={() => handleMissionPress(mission.id)}
            onApply={() => handleApplyMission(mission.id)}
            showBonus={false}
          />
        ))}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
  },
  filtersScroll: {
    paddingHorizontal: 20,
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

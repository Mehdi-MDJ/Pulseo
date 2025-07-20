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
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';

export default function MissionDetailScreen() {
  const navigation = useNavigation();
  const [mission] = useState({
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
    description: 'Mission d\'infirmier en service d\'urgences pour des gardes de nuit. Prise en charge de patients en situation d\'urgence, collaboration avec l\'équipe médicale.',
    requirements: [
      'Diplôme d\'État d\'Infirmier',
      'Expérience en urgences requise',
      'Disponibilité immédiate',
      'Certification BLS/ACLS',
    ],
    benefits: [
      'Taux horaire attractif',
      'Primes de nuit',
      'Formation continue',
      'Équipe dynamique',
    ],
  });

  const handleApply = () => {
    Alert.alert(
      'Postuler à la mission',
      'Êtes-vous sûr de vouloir postuler à cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Postuler',
          onPress: () => {
            Alert.alert('Succès', 'Votre candidature a été envoyée !');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleShare = () => {
    // Logique de partage
    console.log('Partager la mission');
  };

  const renderMissionHeader = () => (
    <View style={styles.missionHeader}>
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        style={styles.missionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.matchScoreBadge}>
          <Ionicons name="star" size={16} color="#ffffff" />
          <Text style={styles.matchScoreText}>{mission.matchScore}% match</Text>
        </View>

        <Text style={styles.missionTitle}>{mission.title}</Text>
        <Text style={styles.establishment}>{mission.establishment}</Text>

        <View style={styles.missionDetails}>
          <View style={styles.missionDetail}>
            <Ionicons name="location-outline" size={16} color="#ffffff" />
            <Text style={styles.missionDetailText}>{mission.location} • {mission.distance}</Text>
          </View>
          <View style={styles.missionDetail}>
            <Ionicons name="time-outline" size={16} color="#ffffff" />
            <Text style={styles.missionDetailText}>{mission.shift} • {mission.duration}</Text>
          </View>
        </View>

        <View style={styles.urgencyBadge}>
          <Text style={styles.urgencyText}>Urgent</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderInfoSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Informations</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Taux horaire</Text>
        <Text style={styles.infoValue}>{mission.hourlyRate}€/h</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Spécialisations</Text>
        <View style={styles.specializationsContainer}>
          {mission.specializations.map((spec, index) => (
            <View key={index} style={styles.specTag}>
              <Text style={styles.specText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderDescriptionSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.descriptionText}>{mission.description}</Text>
    </View>
  );

  const renderRequirementsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Prérequis</Text>
      {mission.requirements.map((req, index) => (
        <View key={index} style={styles.requirementItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.requirementText}>{req}</Text>
        </View>
      ))}
    </View>
  );

  const renderBenefitsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Avantages</Text>
      {mission.benefits.map((benefit, index) => (
        <View key={index} style={styles.benefitItem}>
          <Ionicons name="star" size={16} color="#fbbf24" />
          <Text style={styles.benefitText}>{benefit}</Text>
        </View>
      ))}
    </View>
  );

  const renderApplyButton = () => (
    <View style={styles.applyContainer}>
      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.applyButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.applyButtonText}>Postuler maintenant</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Détails mission"
        onBack={() => navigation.goBack()}
        onRightPress={handleShare}
        rightIcon="share-outline"
        backgroundColor="#2563eb"
        textColor="#ffffff"
      />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderMissionHeader()}
        {renderInfoSection()}
        {renderDescriptionSection()}
        {renderRequirementsSection()}
        {renderBenefitsSection()}
      </ScrollView>
      {renderApplyButton()}
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
    paddingBottom: 100,
  },
  missionHeader: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  missionGradient: {
    padding: 24,
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 4,
  },
  missionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  establishment: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  missionDetails: {
    marginBottom: 16,
  },
  missionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  missionDetailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    margin: 20,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  applyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  applyButton: {
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  applyButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

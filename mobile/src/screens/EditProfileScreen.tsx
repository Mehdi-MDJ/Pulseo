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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState({
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@email.com',
    phone: '+33 6 12 34 56 78',
    specializations: ['Urgences', 'Cardiologie', 'Pédiatrie'],
    experience: '5 ans',
    bio: 'Infirmière expérimentée spécialisée en urgences et cardiologie.',
  });

  const [editingField, setEditingField] = useState<string | null>(null);

  const handleSave = () => {
    Alert.alert('Succès', 'Profil mis à jour avec succès', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#1f2937" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Modifier le profil</Text>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Informations personnelles</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Prénom</Text>
        <TextInput
          style={styles.input}
          value={profile.firstName}
          onChangeText={(text) => setProfile(prev => ({ ...prev, firstName: text }))}
          placeholder="Votre prénom"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nom</Text>
        <TextInput
          style={styles.input}
          value={profile.lastName}
          onChangeText={(text) => setProfile(prev => ({ ...prev, lastName: text }))}
          placeholder="Votre nom"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={profile.email}
          onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
          placeholder="votre.email@exemple.com"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Téléphone</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
          placeholder="+33 6 12 34 56 78"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderSpecializationsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Spécialisations</Text>
      <Text style={styles.sectionSubtitle}>
        Sélectionnez vos domaines d'expertise
      </Text>

      <View style={styles.specializationsContainer}>
        {['Urgences', 'Cardiologie', 'Pédiatrie', 'Réanimation', 'Chirurgie', 'Gériatrie'].map((spec) => (
          <TouchableOpacity
            key={spec}
            style={[
              styles.specTag,
              profile.specializations.includes(spec) && styles.specTagActive
            ]}
            onPress={() => {
              if (profile.specializations.includes(spec)) {
                setProfile(prev => ({
                  ...prev,
                  specializations: prev.specializations.filter(s => s !== spec)
                }));
              } else {
                setProfile(prev => ({
                  ...prev,
                  specializations: [...prev.specializations, spec]
                }));
              }
            }}
          >
            <Text style={[
              styles.specText,
              profile.specializations.includes(spec) && styles.specTextActive
            ]}>
              {spec}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBioSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bio</Text>
      <Text style={styles.sectionSubtitle}>
        Présentez-vous en quelques mots
      </Text>

      <TextInput
        style={styles.bioInput}
        value={profile.bio}
        onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
        placeholder="Décrivez votre expérience et vos compétences..."
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderProfileSection()}
        {renderSpecializationsSection()}
        {renderBioSection()}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  specTagActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  specText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  specTextActive: {
    color: '#ffffff',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    minHeight: 100,
  },
});

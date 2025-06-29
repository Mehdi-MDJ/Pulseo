import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    notifications: true,
    location: true,
    darkMode: false,
    sound: true,
    vibration: true,
  });

  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Notifications push',
          subtitle: 'Recevoir des notifications pour les nouvelles missions',
          type: 'switch',
          value: settings.notifications,
          onValueChange: (value: boolean) => setSettings(prev => ({ ...prev, notifications: value })),
        },
        {
          id: 'sound',
          title: 'Sons',
          subtitle: 'Activer les sons pour les notifications',
          type: 'switch',
          value: settings.sound,
          onValueChange: (value: boolean) => setSettings(prev => ({ ...prev, sound: value })),
        },
        {
          id: 'vibration',
          title: 'Vibration',
          subtitle: 'Activer la vibration pour les notifications',
          type: 'switch',
          value: settings.vibration,
          onValueChange: (value: boolean) => setSettings(prev => ({ ...prev, vibration: value })),
        },
      ]
    },
    {
      title: 'Préférences',
      items: [
        {
          id: 'location',
          title: 'Localisation',
          subtitle: 'Partager ma position pour les missions proches',
          type: 'switch',
          value: settings.location,
          onValueChange: (value: boolean) => setSettings(prev => ({ ...prev, location: value })),
        },
        {
          id: 'darkMode',
          title: 'Mode sombre',
          subtitle: 'Activer le thème sombre',
          type: 'switch',
          value: settings.darkMode,
          onValueChange: (value: boolean) => setSettings(prev => ({ ...prev, darkMode: value })),
        },
      ]
    },
    {
      title: 'Compte',
      items: [
        {
          id: 'privacy',
          title: 'Confidentialité',
          subtitle: 'Gérer vos paramètres de confidentialité',
          type: 'navigate',
          action: () => Alert.alert('Confidentialité', 'Page de confidentialité'),
        },
        {
          id: 'security',
          title: 'Sécurité',
          subtitle: 'Changer votre mot de passe',
          type: 'navigate',
          action: () => Alert.alert('Sécurité', 'Page de sécurité'),
        },
        {
          id: 'logout',
          title: 'Se déconnecter',
          subtitle: 'Déconnecter de votre compte',
          type: 'action',
          action: () => {
            Alert.alert(
              'Déconnexion',
              'Êtes-vous sûr de vouloir vous déconnecter ?',
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Déconnecter', style: 'destructive', onPress: () => navigation.goBack() }
              ]
            );
          },
          color: '#ef4444',
        },
      ]
    }
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#1f2937" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Paramètres</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  const renderSettingsItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingsItem}
      onPress={item.type === 'navigate' || item.type === 'action' ? item.action : undefined}
    >
      <View style={styles.settingsItemLeft}>
        <Text style={[styles.settingsItemTitle, { color: item.color || '#1f2937' }]}>
          {item.title}
        </Text>
        <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
      </View>
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onValueChange}
          trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
          thumbColor={item.value ? '#ffffff' : '#f3f4f6'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>{section.title}</Text>
            {section.items.map(renderSettingsItem)}
          </View>
        ))}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  settingsSection: {
    margin: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsItemLeft: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});

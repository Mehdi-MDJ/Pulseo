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
import { useThemeMode } from '../theme';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { mode, setMode } = useThemeMode();
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Thème</Text>
            <View style={styles.themeSwitchRow}>
              <TouchableOpacity
                style={[styles.themeButton, mode === 'light' && styles.themeButtonActive]}
                onPress={() => setMode('light')}
                accessibilityLabel="Activer le mode clair"
              >
                <Ionicons name="sunny" size={20} color={mode === 'light' ? '#fff' : '#1f2937'} />
                <Text style={[styles.themeButtonText, mode === 'light' && { color: '#fff' }]}>Clair</Text>
                {mode === 'light' && <Ionicons name="checkmark" size={16} color="#fff" style={{ marginLeft: 4 }} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeButton, mode === 'dark' && styles.themeButtonActive]}
                onPress={() => setMode('dark')}
                accessibilityLabel="Activer le mode sombre"
              >
                <Ionicons name="moon" size={20} color={mode === 'dark' ? '#fff' : '#1f2937'} />
                <Text style={[styles.themeButtonText, mode === 'dark' && { color: '#fff' }]}>Sombre</Text>
                {mode === 'dark' && <Ionicons name="checkmark" size={16} color="#fff" style={{ marginLeft: 4 }} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginRight: 12,
  },
  themeSwitchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  themeButtonActive: {
    backgroundColor: '#2563eb',
  },
  themeButtonText: {
    color: '#1f2937',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

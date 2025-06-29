import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HelpScreen() {
  const navigation = useNavigation();

  const helpSections = [
    {
      title: 'Questions fréquentes',
      items: [
        {
          id: 'how-to-apply',
          title: 'Comment postuler à une mission ?',
          icon: 'help-circle-outline',
        },
        {
          id: 'payment',
          title: 'Comment fonctionne le paiement ?',
          icon: 'card-outline',
        },
        {
          id: 'availability',
          title: 'Comment gérer mes disponibilités ?',
          icon: 'calendar-outline',
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          id: 'contact',
          title: 'Nous contacter',
          subtitle: 'Par email ou téléphone',
          icon: 'mail-outline',
          action: () => Linking.openURL('mailto:support@nurselink.ai'),
        },
        {
          id: 'chat',
          title: 'Chat en ligne',
          subtitle: 'Support en temps réel',
          icon: 'chatbubble-outline',
          action: () => {},
        },
        {
          id: 'feedback',
          title: 'Donner un avis',
          subtitle: 'Votre opinion compte',
          icon: 'star-outline',
          action: () => {},
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
      <Text style={styles.headerTitle}>Aide & Support</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  const renderHelpItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.helpItem}
      onPress={item.action}
    >
      <View style={styles.helpItemLeft}>
        <Ionicons name={item.icon as any} size={20} color="#6b7280" />
        <View style={styles.helpItemContent}>
          <Text style={styles.helpItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.helpItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
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
        {helpSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.helpSection}>
            <Text style={styles.helpSectionTitle}>{section.title}</Text>
            {section.items.map(renderHelpItem)}
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
  helpSection: {
    margin: 20,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  helpItem: {
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
  helpItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helpItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  helpItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function ChatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations] = useState([
    {
      id: 1,
      establishment: 'CHU Lyon',
      lastMessage: 'Bonjour, votre candidature a été acceptée !',
      timestamp: '10:30',
      unread: 2,
      avatar: '🏥',
      status: 'online',
      mission: 'Infirmier de nuit - Réanimation',
    },
    {
      id: 2,
      establishment: 'Centre Hospitalier Villeurbanne',
      lastMessage: 'Pouvez-vous confirmer votre disponibilité ?',
      timestamp: 'Hier',
      unread: 0,
      avatar: '🏨',
      status: 'offline',
      mission: 'Infirmier urgences',
    },
    {
      id: 3,
      establishment: 'Clinique du Parc',
      lastMessage: 'Merci pour votre mission, tout s\'est bien passé.',
      timestamp: 'Lun',
      unread: 0,
      avatar: '🏥',
      status: 'online',
      mission: 'Infirmier bloc opératoire',
    },
  ]);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Messages</Text>
      <TouchableOpacity style={styles.newMessageButton}>
        <Ionicons name="add" size={24} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderSearch = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  const renderConversation = ({ item }) => (
    <TouchableOpacity style={styles.conversationCard}>
      <View style={styles.conversationHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: item.status === 'online' ? colors.success[500] : colors.text.tertiary }]} />
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationTitleRow}>
            <Text style={styles.establishmentName}>{item.establishment}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          <Text style={styles.missionTitle}>{item.mission}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>

        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary[500] }]}>
            <Ionicons name="document-text" size={20} color={colors.text.inverse} />
          </View>
          <Text style={styles.quickActionText}>Modèles de messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: colors.warning[500] }]}>
            <Ionicons name="notifications" size={20} color={colors.text.inverse} />
          </View>
          <Text style={styles.quickActionText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: colors.success[500] }]}>
            <Ionicons name="settings" size={20} color={colors.text.inverse} />
          </View>
          <Text style={styles.quickActionText}>Paramètres</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearch()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderQuickActions()}
        <View style={styles.conversationsContainer}>
          <Text style={styles.sectionTitle}>Conversations récentes</Text>
          {conversations.map(renderConversation)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  newMessageButton: {
    padding: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  quickActionsContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: spacing.borderRadius.md,
    shadowColor: colors.app.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  conversationsContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.lg,
  },
  conversationCard: {
    backgroundColor: colors.background.primary,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
    shadowColor: colors.app.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    fontSize: 32,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background.secondary,
    textAlign: 'center',
    lineHeight: 50,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  establishmentName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  missionTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary[500],
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  lastMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal,
  },
  unreadBadge: {
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  unreadCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
});

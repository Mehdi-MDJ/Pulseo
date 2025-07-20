import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { designSystem, getUrgencyColor, getMatchingColor, createCardStyle } from '../theme/designSystem';
import { useAppTheme } from '../theme';

const { width } = Dimensions.get('window');

interface MissionCardProps {
  mission: {
    id: number;
    title: string;
    establishment: string;
    location: string;
    distance?: string;
    hourlyRate: number;
    shift: string;
    duration: string;
    matchScore: number;
    urgency: 'high' | 'medium' | 'low';
    specializations: string[];
    bonus?: string;
    status?: string;
  };
  mode?: 'compact' | 'normal';
  onPress?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onApply?: () => void;
  showActions?: boolean;
  showBonus?: boolean;
  showStatus?: boolean;
}

export default function MissionCard({
  mission,
  mode = 'normal',
  onPress,
  onAccept,
  onDecline,
  onApply,
  showActions = false,
  showBonus = true,
  showStatus = false,
}: MissionCardProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const isCompact = mode === 'compact';
  const cardWidth = isMobile ? '100%' : mode === 'compact' ? 200 : 500;
  const theme = useAppTheme();

  const getMatchScoreColors = (score: number) => {
    if (score >= 90) return [designSystem.matching.excellent, designSystem.semantic.success];
    if (score >= 80) return [designSystem.matching.good, designSystem.semantic.warning];
    return [designSystem.matching.average, designSystem.text.tertiary];
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'medium': return 'Modéré';
      default: return 'Normal';
    }
  };

  const cardStyle = [
    createCardStyle('elevated'),
    { width: cardWidth, alignSelf: 'center', maxWidth: 500 },
    isMobile ? styles.cardMobile : styles.cardDesktop,
    isCompact ? styles.cardCompact : styles.cardNormal,
    { backgroundColor: theme.background.secondary },
  ];

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Mission ${mission.title} à ${mission.establishment}`}
      accessibilityHint="Appuyez pour voir les détails de la mission"
    >
      {/* Header avec titre et badges */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            isCompact ? styles.titleCompact : styles.titleNormal
          ]} numberOfLines={isCompact ? 2 : 3}>
            {mission.title}
          </Text>

          {/* Badge de matching sphérique */}
          <View style={styles.matchScoreCircleContainer}>
            <View style={styles.matchScoreCircle}>
              <Ionicons name="star" size={14} color={theme.semantic.primary} />
              <Text style={styles.matchScoreCircleText}>{mission.matchScore}%</Text>
            </View>
          </View>
        </View>

        {/* Badge d'urgence */}
        <View style={[
          styles.urgencyBadge,
          { backgroundColor: getUrgencyColor(mission.urgency) }
        ]}>
          <Text style={styles.urgencyText}>
            {getUrgencyText(mission.urgency)}
          </Text>
        </View>

        {/* Badge de statut (si applicable) */}
        {showStatus && mission.status && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{mission.status}</Text>
          </View>
        )}
      </View>

      {/* Établissement */}
      <Text style={[
        styles.establishment,
        isCompact ? styles.establishmentCompact : styles.establishmentNormal
      ]}>
        {mission.establishment}
      </Text>

      {/* Détails de la mission */}
      <View style={styles.details}>
        <View style={styles.detail}>
          <Ionicons
            name="location-outline"
            size={isCompact ? 12 : 14}
            color={designSystem.text.secondary}
          />
          <Text style={[
            styles.detailText,
            isCompact ? styles.detailTextCompact : styles.detailTextNormal
          ]}>
            {mission.location}
            {mission.distance && ` • ${mission.distance}`}
          </Text>
        </View>

        <View style={styles.detail}>
          <Ionicons
            name="time-outline"
            size={isCompact ? 12 : 14}
            color={designSystem.text.secondary}
          />
          <Text style={[
            styles.detailText,
            isCompact ? styles.detailTextCompact : styles.detailTextNormal
          ]}>
            {mission.shift} • {mission.duration}
          </Text>
        </View>
      </View>

      {/* Spécialisations */}
      {!isCompact && (
        <View style={styles.specializations}>
          {mission.specializations.slice(0, 3).map((spec, index) => (
            <View key={index} style={styles.specTag}>
              <Text style={styles.specText}>{spec}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer avec tarif et actions */}
      <View style={styles.footer}>
        <Text style={[
          styles.hourlyRate,
          isCompact ? styles.hourlyRateCompact : styles.hourlyRateNormal
        ]}>
          {mission.hourlyRate}€/h
        </Text>

        {/* Actions */}
        {showActions ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={onDecline}
              accessibilityLabel="Refuser la mission"
            >
              <Text style={styles.declineButtonText}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={onAccept}
              accessibilityLabel="Accepter la mission"
            >
              <Text style={styles.acceptButtonText}>Accepter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.applyButton}
            onPress={onApply}
            accessibilityLabel="Postuler à la mission"
          >
            <Text style={styles.applyButtonText}>Postuler</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bonus (si applicable) */}
      {showBonus && mission.bonus && (
        <View style={styles.bonusContainer}>
          <Ionicons name="gift" size={12} color={designSystem.semantic.warning} />
          <Text style={styles.bonusText}>{mission.bonus}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardMobile: {
    marginHorizontal: designSystem.spacing.md,
  },
  cardDesktop: {
    marginHorizontal: designSystem.spacing.lg,
  },
  cardCompact: {
    marginBottom: designSystem.spacing.sm,
  },
  cardNormal: {
    marginBottom: designSystem.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: designSystem.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: designSystem.spacing.sm,
  },
  title: {
    fontWeight: designSystem.typography.weights.semibold,
    color: designSystem.text.primary,
  },
  titleCompact: {
    fontSize: designSystem.typography.sizes.sm,
    lineHeight: 18,
  },
  titleNormal: {
    fontSize: designSystem.typography.sizes.md,
    lineHeight: 22,
  },
  matchScoreCircleContainer: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  matchScoreCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  matchScoreCircleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginLeft: 4,
  },
  urgencyBadge: {
    paddingHorizontal: designSystem.spacing.xs,
    paddingVertical: 2,
    borderRadius: designSystem.borders.radius.xs,
  },
  urgencyText: {
    fontSize: designSystem.typography.sizes.xs,
    fontWeight: designSystem.typography.weights.medium,
    color: designSystem.text.inverse,
  },
  statusBadge: {
    backgroundColor: designSystem.semantic.info,
    paddingHorizontal: designSystem.spacing.xs,
    paddingVertical: 2,
    borderRadius: designSystem.borders.radius.xs,
  },
  statusText: {
    fontSize: designSystem.typography.sizes.xs,
    fontWeight: designSystem.typography.weights.medium,
    color: designSystem.text.inverse,
  },
  establishment: {
    fontWeight: designSystem.typography.weights.medium,
    color: designSystem.text.secondary,
    marginBottom: designSystem.spacing.sm,
  },
  establishmentCompact: {
    fontSize: designSystem.typography.sizes.xs,
  },
  establishmentNormal: {
    fontSize: designSystem.typography.sizes.sm,
  },
  details: {
    marginBottom: designSystem.spacing.sm,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing.xs,
  },
  detailText: {
    marginLeft: designSystem.spacing.xs,
    color: designSystem.text.secondary,
  },
  detailTextCompact: {
    fontSize: designSystem.typography.sizes.xs,
  },
  detailTextNormal: {
    fontSize: designSystem.typography.sizes.sm,
  },
  specializations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: designSystem.spacing.md,
  },
  specTag: {
    backgroundColor: designSystem.background.secondary,
    paddingHorizontal: designSystem.spacing.xs,
    paddingVertical: 2,
    borderRadius: designSystem.borders.radius.xs,
    marginRight: designSystem.spacing.xs,
    marginBottom: designSystem.spacing.xs,
  },
  specText: {
    fontSize: designSystem.typography.sizes.xs,
    color: designSystem.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourlyRate: {
    fontWeight: designSystem.typography.weights.bold,
    color: designSystem.semantic.primary,
  },
  hourlyRateCompact: {
    fontSize: designSystem.typography.sizes.sm,
  },
  hourlyRateNormal: {
    fontSize: designSystem.typography.sizes.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: designSystem.spacing.xs,
  },
  actionButton: {
    paddingHorizontal: designSystem.spacing.md,
    paddingVertical: designSystem.spacing.xs,
    borderRadius: designSystem.borders.radius.sm,
  },
  declineButton: {
    backgroundColor: designSystem.background.secondary,
  },
  declineButtonText: {
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.weights.medium,
    color: designSystem.text.secondary,
  },
  acceptButton: {
    backgroundColor: designSystem.semantic.success,
  },
  acceptButtonText: {
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.weights.medium,
    color: designSystem.text.inverse,
  },
  applyButton: {
    backgroundColor: designSystem.semantic.primary,
    paddingHorizontal: designSystem.spacing.md,
    paddingVertical: designSystem.spacing.xs,
    borderRadius: designSystem.borders.radius.sm,
  },
  applyButtonText: {
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.weights.medium,
    color: designSystem.text.inverse,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: designSystem.spacing.sm,
    paddingTop: designSystem.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: designSystem.borders.color.light,
  },
  bonusText: {
    fontSize: designSystem.typography.sizes.xs,
    color: designSystem.semantic.warning,
    fontWeight: designSystem.typography.weights.medium,
    marginLeft: designSystem.spacing.xs,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { designSystem } from '../theme/designSystem';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  backgroundColor?: string;
  textColor?: string;
  variant?: 'default' | 'gradient' | 'transparent';
}

export default function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  showMenu = false,
  showNotifications = false,
  onBackPress,
  onMenuPress,
  onNotificationPress,
  notificationCount = 0,
  backgroundColor,
  textColor,
  variant = 'default',
}: ScreenHeaderProps) {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const getHeaderStyle = () => {
    const baseStyle = {
      backgroundColor: backgroundColor || designSystem.background.primary,
      paddingHorizontal: isMobile ? designSystem.spacing.lg : designSystem.spacing.xxl,
      paddingTop: designSystem.spacing.lg,
      paddingBottom: designSystem.spacing.md,
    };

    switch (variant) {
      case 'transparent':
        return { ...baseStyle, backgroundColor: 'transparent' };
      case 'gradient':
        return { ...baseStyle, backgroundColor: designSystem.semantic.primary };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (textColor) return textColor;

    switch (variant) {
      case 'gradient':
        return designSystem.text.inverse;
      default:
        return designSystem.text.primary;
    }
  };

  const getIconColor = () => {
    return getTextColor();
  };

  return (
    <View style={[styles.container, getHeaderStyle()]}>
      <StatusBar
        barStyle={variant === 'gradient' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor || designSystem.background.primary}
      />

      {/* Barre d'actions */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          {showBack && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBackPress}
              accessibilityRole="button"
              accessibilityLabel="Retour"
              accessibilityHint="Retourne à l'écran précédent"
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={getIconColor()}
              />
            </TouchableOpacity>
          )}

          {showMenu && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onMenuPress}
              accessibilityRole="button"
              accessibilityLabel="Menu"
              accessibilityHint="Ouvre le menu principal"
            >
              <Ionicons
                name="menu"
                size={24}
                color={getIconColor()}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightActions}>
          {showNotifications && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNotificationPress}
              accessibilityRole="button"
              accessibilityLabel={`Notifications (${notificationCount})`}
              accessibilityHint="Ouvre le centre de notifications"
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={getIconColor()}
              />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Titre et sous-titre */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: getTextColor() }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: getTextColor() }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing.md,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: designSystem.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: designSystem.spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: designSystem.semantic.error,
    borderRadius: designSystem.borders.radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: designSystem.typography.sizes.xs,
    fontWeight: designSystem.typography.weights.bold,
    color: designSystem.text.inverse,
  },
  titleContainer: {
    marginBottom: designSystem.spacing.sm,
  },
  title: {
    fontSize: designSystem.typography.sizes.xxl,
    fontWeight: designSystem.typography.weights.bold,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: designSystem.typography.sizes.md,
    fontWeight: designSystem.typography.weights.normal,
    marginTop: designSystem.spacing.xs,
    opacity: 0.8,
  },
});

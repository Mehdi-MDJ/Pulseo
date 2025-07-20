import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { designSystem } from '../theme/designSystem';

interface TabItem {
  key: string;
  title: string;
  icon: string;
  iconFocused: string;
  badge?: number;
}

interface BottomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  variant?: 'default' | 'elevated' | 'minimal';
}

export default function BottomTabs({
  tabs,
  activeTab,
  onTabPress,
  variant = 'default',
}: BottomTabsProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const getContainerStyle = () => {
    const baseStyle = {
      backgroundColor: designSystem.background.primary,
      paddingHorizontal: isMobile ? designSystem.spacing.md : designSystem.spacing.lg,
      paddingBottom: designSystem.spacing.lg,
      paddingTop: designSystem.spacing.md,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...designSystem.shadows.large,
          borderTopLeftRadius: designSystem.borders.radius.xl,
          borderTopRightRadius: designSystem.borders.radius.xl,
        };
      case 'minimal':
        return {
          ...baseStyle,
          borderTopWidth: designSystem.borders.width.thin,
          borderTopColor: designSystem.borders.color.light,
        };
      default:
        return {
          ...baseStyle,
          ...designSystem.shadows.medium,
          borderTopLeftRadius: designSystem.borders.radius.lg,
          borderTopRightRadius: designSystem.borders.radius.lg,
        };
    }
  };

  const getTabStyle = (isActive: boolean) => {
    const baseStyle = {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: designSystem.spacing.sm,
      borderRadius: designSystem.borders.radius.md,
    };

    if (isActive) {
      return {
        ...baseStyle,
        backgroundColor: designSystem.background.secondary,
      };
    }

    return baseStyle;
  };

  const getIconColor = (isActive: boolean) => {
    return isActive ? designSystem.semantic.primary : designSystem.text.tertiary;
  };

  const getTextColor = (isActive: boolean) => {
    return isActive ? designSystem.text.primary : designSystem.text.tertiary;
  };

  return (
    <View style={[styles.container, getContainerStyle()]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={getTabStyle(isActive)}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={tab.title}
            accessibilityState={{ selected: isActive }}
            accessibilityHint={`Ouvre l'onglet ${tab.title}`}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={(isActive ? tab.iconFocused : tab.icon) as any}
                size={24}
                color={getIconColor(isActive)}
              />
              {tab.badge && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabText,
                { color: getTextColor(isActive) }
              ]}
              numberOfLines={1}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: designSystem.spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: designSystem.semantic.error,
    borderRadius: designSystem.borders.radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: designSystem.typography.sizes.xs,
    fontWeight: designSystem.typography.weights.bold,
    color: designSystem.text.inverse,
  },
  tabText: {
    fontSize: designSystem.typography.sizes.xs,
    fontWeight: designSystem.typography.weights.medium,
    textAlign: 'center',
  },
});

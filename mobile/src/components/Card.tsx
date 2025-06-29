import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large' | 'full';
}

export default function Card({
  children,
  style,
  padding = 'medium',
  shadow = 'small',
  borderRadius = 'medium',
}: CardProps) {
  const getPadding = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return spacing.sm;
      case 'large':
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  const getShadow = () => {
    switch (shadow) {
      case 'none':
        return {};
      case 'medium':
        return {
          shadowColor: colors.app.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        };
      case 'large':
        return {
          shadowColor: colors.app.cardShadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 12,
        };
      default:
        return {
          shadowColor: colors.app.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
    }
  };

  const getBorderRadius = (): number => {
    switch (borderRadius) {
      case 'small':
        return spacing.borderRadius.sm;
      case 'large':
        return spacing.borderRadius.lg;
      case 'full':
        return spacing.borderRadius.full;
      default:
        return spacing.borderRadius.md;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          padding: getPadding(),
          borderRadius: getBorderRadius(),
          ...getShadow(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
  },
});

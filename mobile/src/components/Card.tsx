import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { designSystem, createCardStyle } from '../theme/designSystem';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Card({
  children,
  variant = 'default',
  style,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const cardStyle = createCardStyle(variant);

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[cardStyle, style]}
      accessibilityRole="none"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: designSystem.colors.background.primary,
  },
});

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { designSystem, createButtonStyle } from '../theme/designSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const buttonStyle = createButtonStyle(variant, size, disabled);
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  const [pressed, setPressed] = React.useState(false);

  const getTextColor = (): string => {
    if (disabled) return designSystem.text.disabled;

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return designSystem.text.inverse;
      case 'outline':
        return designSystem.semantic.primary;
      case 'ghost':
        return designSystem.text.primary;
      default:
        return designSystem.text.primary;
    }
  };

  const getIconColor = (): string => {
    return getTextColor();
  };

  const renderIcon = () => {
    if (!icon || loading) return null;

    return (
      <Ionicons
        name={icon as any}
        size={iconSize}
        color={getIconColor()}
        style={{
          marginLeft: iconPosition === 'right' ? designSystem.spacing.xs : 0,
          marginRight: iconPosition === 'left' ? designSystem.spacing.xs : 0,
        }}
      />
    );
  };

  // Feedback visuel tactile
  const feedbackStyle = pressed
    ? {
        opacity: 0.7,
        transform: [{ scale: 0.97 }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      }
    : {};

  return (
    <Pressable
      style={({ pressed: isPressed }) => [buttonStyle, style, isPressed && feedbackStyle]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getIconColor()}
          style={{ marginRight: designSystem.spacing.xs }}
        />
      ) : (
        iconPosition === 'left' && renderIcon()
      )}

      <Text
        style={[
          {
            fontSize: designSystem.typography.sizes[size === 'small' ? 'sm' : 'md'],
            fontWeight: designSystem.typography.weights.semibold,
            color: getTextColor(),
          },
          textStyle
        ]}
      >
        {title}
      </Text>

      {iconPosition === 'right' && renderIcon()}
    </Pressable>
  );
}

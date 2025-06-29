import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

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
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: spacing.borderRadius.md,
      borderWidth: variant === 'outline' ? 1 : 0,
    };

    // Taille
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = spacing.md;
        baseStyle.paddingVertical = spacing.sm;
        break;
      case 'large':
        baseStyle.paddingHorizontal = spacing.xl;
        baseStyle.paddingVertical = spacing.md;
        break;
      default:
        baseStyle.paddingHorizontal = spacing.lg;
        baseStyle.paddingVertical = spacing.sm;
    }

    // Variante
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = colors.secondary[500];
        break;
      case 'secondary':
        baseStyle.backgroundColor = colors.primary[500];
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderColor = colors.secondary[500];
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'danger':
        baseStyle.backgroundColor = colors.error[500];
        break;
    }

    // État désactivé
    if (disabled) {
      baseStyle.backgroundColor = colors.border.light;
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? typography.fontSize.sm : typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
    };

    // Couleur du texte selon la variante
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        baseStyle.color = colors.text.inverse;
        break;
      case 'outline':
        baseStyle.color = colors.secondary[500];
        break;
      case 'ghost':
        baseStyle.color = colors.text.primary;
        break;
    }

    // État désactivé
    if (disabled) {
      baseStyle.color = colors.text.disabled;
    }

    return baseStyle;
  };

  const getIconColor = (): string => {
    if (disabled) return colors.text.disabled;

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return colors.text.inverse;
      case 'outline':
        return colors.secondary[500];
      case 'ghost':
        return colors.text.primary;
      default:
        return colors.text.primary;
    }
  };

  const getIconSize = (): number => {
    return size === 'small' ? 16 : 20;
  };

  const renderIcon = () => {
    if (!icon || loading) return null;

    return (
      <Ionicons
        name={icon}
        size={getIconSize()}
        color={getIconColor()}
        style={{
          marginLeft: iconPosition === 'right' ? spacing.xs : 0,
          marginRight: iconPosition === 'left' ? spacing.xs : 0,
        }}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getIconColor()}
          style={{ marginRight: spacing.xs }}
        />
      ) : (
        iconPosition === 'left' && renderIcon()
      )}

      <Text style={[getTextStyle(), textStyle]}>{title}</Text>

      {iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
}

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = [
      styles.button,
      variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
    ];

    if (size === 'small') {
      baseStyle.push(styles.smallButton);
    } else if (size === 'large') {
      baseStyle.push(styles.largeButton);
    }

    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }

    return StyleSheet.flatten([baseStyle, style]);
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = [
      styles.text,
      variant === 'primary' ? styles.primaryText : styles.secondaryText,
    ];

    if (size === 'small') {
      baseStyle.push(styles.smallText);
    } else if (size === 'large') {
      baseStyle.push(styles.largeText);
    }

    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return StyleSheet.flatten([baseStyle, textStyle]);
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.primary.contrast : theme.colors.text.primary}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    ...theme.commonStyles.primaryButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.tertiary,
  },
  smallButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing['2xl'],
    minHeight: 72,
  },
  disabledButton: {
    backgroundColor: theme.colors.background.tertiary,
    opacity: 0.5,
  },
  text: {
    ...theme.commonStyles.primaryButtonText,
    textAlign: 'center',
  },
  primaryText: {
    color: theme.colors.primary.contrast,
  },
  secondaryText: {
    color: theme.colors.text.primary,
  },
  smallText: {
    fontSize: theme.typography.size.md,
  },
  largeText: {
    fontSize: theme.typography.size.xl,
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
});

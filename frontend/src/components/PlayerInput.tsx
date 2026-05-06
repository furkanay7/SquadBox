import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme/theme';

interface PlayerInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  showClearButton?: boolean;
  onClear?: () => void;
}

export const PlayerInput: React.FC<PlayerInputProps> = ({
  label,
  placeholder = 'Enter text...',
  value,
  onChangeText,
  onSubmitEditing,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  showClearButton = false,
  onClear,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle = [styles.container];

    if (isFocused) {
      baseStyle.push(styles.containerFocused);
    }

    if (error) {
      baseStyle.push(styles.containerError);
    }

    if (disabled) {
      baseStyle.push(styles.containerDisabled);
    }

    return StyleSheet.flatten([baseStyle, style]);
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle = [styles.input];

    if (multiline) {
      baseStyle.push(styles.multilineInput);
    }

    if (disabled) {
      baseStyle.push(styles.inputDisabled);
    }

    return StyleSheet.flatten([baseStyle, inputStyle]);
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      <View style={getContainerStyle()}>
        <TextInput
          style={getInputStyle()}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.disabled}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        {showClearButton && value.length > 0 && !disabled && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClear}
            activeOpacity={0.8}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  container: {
    ...theme.commonStyles.input,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerFocused: {
    borderColor: theme.colors.primary.main,
  },
  containerError: {
    borderColor: theme.colors.error.main,
  },
  containerDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.background.tertiary,
  },
  input: {
    flex: 1,
    ...theme.commonStyles.input,
    borderWidth: 0,
    margin: 0,
    padding: 0,
    paddingHorizontal: theme.spacing.lg,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    color: theme.colors.text.disabled,
  },
  clearButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.error.main,
    marginTop: theme.spacing.xs,
  },
});

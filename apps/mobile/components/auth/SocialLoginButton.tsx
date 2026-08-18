import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View, 
  Platform
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

type Provider = 'google' | 'apple' | 'facebook';

interface SocialLoginButtonProps {
  provider: Provider;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function SocialLoginButton({
  provider,
  label,
  loading = false,
  disabled = false,
  onPress,
}: SocialLoginButtonProps) {
  const { colors } = useTheme();
  
  const providerConfig = {
    google: {
      iconName: 'google',
      backgroundColor: colors.card,
      textColor: colors.text,
      borderColor: colors.border,
      iconColor: colors.text,
    },
    apple: {
      iconName: 'apple',
      backgroundColor: colors.primary,
      textColor: colors.primaryText,
      borderColor: colors.primary,
      iconColor: colors.primaryText,
    },
    facebook: {
      iconName: 'facebook',
      backgroundColor: '#1877F2',
      textColor: '#ffffff',
      borderColor: '#1877F2',
      iconColor: '#ffffff',
    },
  };

  const config = providerConfig[provider];
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: config.backgroundColor, borderColor: config.borderColor },
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <View style={styles.iconContainer}>
        {loading ? (
          <ActivityIndicator color={config.textColor} size="small" />
        ) : (
          <FontAwesome5 name={config.iconName} size={20} color={config.iconColor} />
        )}
      </View>
      <Text style={[styles.label, { color: config.textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    position: 'absolute',
    left: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
});

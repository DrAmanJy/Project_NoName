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

type Provider = 'google' | 'apple' | 'facebook';

interface SocialLoginButtonProps {
  provider: Provider;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const providerConfig = {
  google: {
    iconName: 'google',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#e0e0e0',
    iconColor: '#000000',
  },
  apple: {
    iconName: 'apple',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    borderColor: '#000000',
    iconColor: '#ffffff',
  },
  facebook: {
    iconName: 'facebook',
    backgroundColor: '#1877F2',
    textColor: '#ffffff',
    borderColor: '#1877F2',
    iconColor: '#ffffff',
  },
};

export function SocialLoginButton({
  provider,
  label,
  loading = false,
  disabled = false,
  onPress,
}: SocialLoginButtonProps) {
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
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator color={config.textColor} size="small" />
        ) : (
          <FontAwesome5 name={config.iconName} size={20} color={config.iconColor} style={styles.icon} />
        )}
        <Text style={[styles.label, { color: config.textColor }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  disabled: {
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocialLoginButton } from '../../components/auth/SocialLoginButton';
import { ErrorDialog } from '../../components/ErrorDialog';
import { useAuth } from '../../features/auth/auth-provider';
import type { AuthProviderType } from '../../features/auth/auth-types';

function getAvailableAuthProviders(): readonly AuthProviderType[] {
  switch (Platform.OS) {
    case 'ios':
      return ['apple', 'facebook'];
    case 'android':
      return ['google', 'facebook'];
    default:
      return ['google', 'facebook', 'apple'];
  }
}

const PROVIDER_LABELS: Record<AuthProviderType, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
  facebook: 'Continue with Facebook',
};

export default function LoginScreen() {
  const [loadingProvider, setLoadingProvider] = useState<AuthProviderType | null>(null);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signIn } = useAuth();
  
  const availableProviders = getAvailableAuthProviders();

  const handleLogin = async (provider: AuthProviderType) => {
    if (loadingProvider) return;

    setLoadingProvider(provider);
    try {
      await signIn(provider);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unexpected error occurred during sign in.';
      setErrorMessage(msg);
      setErrorDialogVisible(true);
      setLoadingProvider(null);
    }
  };

  const isAnyLoading = loadingProvider !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top: Branding and Welcome */}
        <View style={styles.headerContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to your account</Text>
        </View>

        {/* Center: Social Authentication Buttons */}
        <View style={styles.buttonsContainer}>
          {availableProviders.map((provider) => (
            <SocialLoginButton
              key={provider}
              provider={provider}
              label={PROVIDER_LABELS[provider]}
              onPress={() => handleLogin(provider)}
              loading={loadingProvider === provider}
              disabled={isAnyLoading && loadingProvider !== provider}
            />
          ))}
        </View>

        {/* Bottom: Legal Text */}
        <View style={styles.footerContainer}>
          <Text style={styles.legalText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>

        <ErrorDialog
          visible={errorDialogVisible}
          message={errorMessage}
          title="Sign In Failed"
          onClose={() => setErrorDialogVisible(false)}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: '#111111',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 48,
  },
  footerContainer: {
    alignItems: 'center',
  },
  legalText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: '#111111',
    fontWeight: '600',
  },
});

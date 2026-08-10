import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { SocialLoginButton } from '../../components/auth/SocialLoginButton';
import { useAuth } from '../../features/auth/auth-provider';
import type { AuthProviderType } from '../../features/auth/auth-types';

export default function LoginScreen() {
  const [loadingProvider, setLoadingProvider] = useState<AuthProviderType | null>(null);
  const { signIn } = useAuth();


  const handleLogin = async (provider: AuthProviderType) => {
    // Prevent simultaneous requests
    if (loadingProvider) return;

    setLoadingProvider(provider);
    try {
      await signIn(provider);
    } catch {
      Alert.alert('Error', 'Failed to sign in');
      setLoadingProvider(null);
    }
  };

  const handleGoogleLogin = () => handleLogin('google');
  const handleAppleLogin = () => handleLogin('apple');
  const handleFacebookLogin = () => handleLogin('facebook');

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
          <SocialLoginButton
            provider="google"
            label="Continue with Google"
            onPress={handleGoogleLogin}
            loading={loadingProvider === 'google'}
            disabled={isAnyLoading && loadingProvider !== 'google'}
          />
          <SocialLoginButton
            provider="apple"
            label="Continue with Apple"
            onPress={handleAppleLogin}
            loading={loadingProvider === 'apple'}
            disabled={isAnyLoading && loadingProvider !== 'apple'}
          />
          <SocialLoginButton
            provider="facebook"
            label="Continue with Facebook"
            onPress={handleFacebookLogin}
            loading={loadingProvider === 'facebook'}
            disabled={isAnyLoading && loadingProvider !== 'facebook'}
          />
        </View>

        {/* Bottom: Legal Text */}
        <View style={styles.footerContainer}>
          <Text style={styles.legalText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 48,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  legalText: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: '#000000',
    fontWeight: '500',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { SocialLoginButton } from '../../components/auth/SocialLoginButton';
import { CustomDialog } from '../../components/CustomDialog';
import { useAuth } from '../../features/auth/auth-provider';
import type { AuthProviderType } from '../../features/auth/auth-types';
import { useTheme } from '../../lib/theme';

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
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const availableProviders = getAvailableAuthProviders();

  const handleLogin = async (provider: AuthProviderType) => {
    if (loadingProvider) return;

    setLoadingProvider(provider);
    try {
      await signIn(provider);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'An unexpected error occurred during sign in.';
      setErrorMessage(msg);
      setErrorDialogVisible(true);
      setLoadingProvider(null);
    }
  };

  const isAnyLoading = loadingProvider !== null;

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
        }}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
              {/* Top: Branding and Welcome */}
              <View style={styles.headerContainer}>
                <View style={styles.logoPlaceholder}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={{ width: 100, height: 100 }}
                    resizeMode="contain"
                  />
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

              <CustomDialog
                visible={errorDialogVisible}
                type="error"
                message={errorMessage}
                title="Sign In Failed"
                onClose={() => setErrorDialogVisible(false)}
              />
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  safeArea: {
    flex: 1,
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
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff', // Keep white due to dark image background overlay
    marginBottom: 10,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#d4d4d4',
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
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

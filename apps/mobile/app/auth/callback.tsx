import { View } from 'react-native';
import { HomeScreenSkeleton } from '../../components/HomeScreenSkeleton';

// This is a dummy route to handle the OAuth deep link redirect cleanly.
// BackendAuthService catches the deep link code exchange via openAuthSessionAsync.
// Once auth succeeds, the (auth)/_layout.tsx will redirect the user to /(tabs).
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../features/auth/auth-provider';
import { useTheme } from '../../lib/theme';

// This route catches the OAuth deep link.
// The code exchange happens in BackendAuthService.
export default function AuthCallback() {
  const { status } = useAuth();
  const { colors } = useTheme();

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <HomeScreenSkeleton />
    </View>
  );
}

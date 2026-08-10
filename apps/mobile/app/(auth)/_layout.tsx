import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../features/auth/auth-provider';
import { LoadingScreen } from '../../components/LoadingScreen';

export default function AuthLayout() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}

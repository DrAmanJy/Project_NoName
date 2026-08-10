import { Redirect } from 'expo-router';
import { useAuth } from '../features/auth/auth-provider';
import { LoadingScreen } from '../components/LoadingScreen';

export default function RootIndex() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

import { Stack } from 'expo-router';
import { useTheme } from '../../../lib/theme';

export default function SubmissionsLayout() {
  const { colors } = useTheme();
  
  return (
    <Stack screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: colors.surface },
      headerShadowVisible: false,
      headerTintColor: colors.text,
      headerTitleStyle: { color: colors.text, fontSize: 18, fontWeight: '700' }
    }}>
      <Stack.Screen name="index" options={{ title: 'My Submissions' }} />
      <Stack.Screen name="[id]" options={{ title: 'Submission Status' }} />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function SubmissionsLayout() {
  return (
    <Stack screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: '#ffffff' },
      headerShadowVisible: false,
      headerTitleStyle: { color: '#111', fontSize: 18, fontWeight: '700' }
    }}>
      <Stack.Screen name="index" options={{ title: 'My Submissions' }} />
      <Stack.Screen name="[id]" options={{ title: 'Submission Status' }} />
    </Stack>
  );
}

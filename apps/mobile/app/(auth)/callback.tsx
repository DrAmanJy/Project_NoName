import { View } from 'react-native';
import { LoadingScreen } from '../../components/LoadingScreen';

// This is a dummy route to handle the OAuth deep link redirect cleanly.
// BackendAuthService catches the deep link code exchange via openAuthSessionAsync.
// Once auth succeeds, the (auth)/_layout.tsx will redirect the user to /(tabs).
export default function AuthCallback() {
  return (
    <View style={{ flex: 1 }}>
      <LoadingScreen />
    </View>
  );
}

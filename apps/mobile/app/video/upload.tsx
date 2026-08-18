import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoUploader } from '../../features/video/VideoUploader';
import { Stack } from 'expo-router';
import { useTheme } from '../../lib/theme';

export default function UploadVideoScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Upload Video', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
      <VideoUploader />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
});

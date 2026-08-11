import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoUploader } from '../../features/video/VideoUploader';
import { Stack } from 'expo-router';

export default function UploadVideoScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Upload Video' }} />
      <VideoUploader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
});

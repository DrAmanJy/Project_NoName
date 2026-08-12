import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { VideoUploadManager } from '@repo/api-client';
import { MobileUploadSource } from './mobile-upload-source';
import { apiClient, submissionsApi } from '../../lib/api';

export function VideoUploader() {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  const [uploadManager, setUploadManager] = useState<VideoUploadManager | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('idle');
  const [error, setError] = useState<string | null>(null);

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0]!;
      const mime = asset.mimeType || 'video/mp4';
      if (!['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'].includes(mime)) {
        setError('Please select a supported video file (.mp4, .mov, or .webm).');
        return;
      }
      setFileUri(asset.uri);
      setFileName(asset.fileName || 'video.mp4');
      setFileSize(asset.fileSize || 0);
      setMimeType(asset.mimeType || 'video/mp4');
      // Expo ImagePicker returns duration in milliseconds
      setDuration(asset.duration ? asset.duration / 1000 : null);
      setWidth(asset.width || null);
      setHeight(asset.height || null);
      setError(null);
    }
  };

  const startUpload = async () => {
    if (!fileUri || !fileSize || !fileName || !mimeType) return;

    try {
      // 1. Create submission
      // React Native doesn't have crypto.randomUUID() by default, use a fallback or Math.random
      const idempotencyKey = Date.now().toString() + Math.random().toString(36).substring(7);
      const totalParts = Math.ceil(fileSize / (8 * 1024 * 1024));

      const response = await submissionsApi.create({
        fileName: fileName,
        contentType: mimeType as any,
        fileSize: fileSize,
        totalParts,
        country: 'United States',
        durationSeconds: duration || undefined,
        width: width || undefined,
        height: height || undefined,
      }, idempotencyKey);

      const { submissionId, uploadId } = response;

      // 2. Start upload
      const source = new MobileUploadSource(fileUri, fileSize, mimeType);
      const manager = new VideoUploadManager({
        apiClient: apiClient,
        uploadId: uploadId,
        source,
        fileName: fileName,
        onProgress: (uploaded: number, total: number) => {
          setProgress(Math.round((uploaded / total) * 100));
        },
        onStateChange: (state: unknown) => {
          setStatus(state as string);
        },
        onError: (err: Error) => {
          setError(err.message);
        },
        onComplete: (videoId: string) => {
          setStatus('completed');
          console.warn('Upload complete, ID:', videoId);
          router.push(`/submissions/${submissionId}`);
        }
      });

      setUploadManager(manager);
      await manager.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCancel = async () => {
    if (uploadManager) {
      await uploadManager.cancel();
      setUploadManager(null);
      setFileUri(null);
      setProgress(0);
    }
  };

  const handleRetry = async () => {
    if (uploadManager) {
      await uploadManager.start(); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Video</Text>

      {!uploadManager && (
        <View style={styles.actions}>
          <Button title="Pick a video from gallery" onPress={pickVideo} />
          {fileUri && (
            <View style={styles.selectedFile}>
              <Text>Selected: {fileName}</Text>
              <Button title="Start Upload" onPress={startUpload} />
            </View>
          )}
        </View>
      )}

      {uploadManager && (
        <View style={styles.progressContainer}>
          <Text style={styles.statusText}>Uploading {fileName}</Text>
          <Text style={styles.statusText}>{progress}%</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          
          <Text style={styles.statusText}>Status: {status}</Text>
          
          <View style={styles.actionsRow}>
            {status === 'error' && (
              <Button title="Retry" onPress={handleRetry} color="blue" />
            )}
            {status !== 'completed' && status !== 'cancelled' && (
              <Button title="Cancel" onPress={handleCancel} color="red" />
            )}
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  actions: {
    gap: 16,
  },
  selectedFile: {
    marginTop: 20,
    gap: 12,
  },
  progressContainer: {
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

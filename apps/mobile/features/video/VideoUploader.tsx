import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Animated } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { VideoUploadManager } from '@repo/api-client';
import { MobileUploadSource } from './mobile-upload-source';
import { apiClient, submissionsApi } from '../../lib/api';
import { useTheme } from '../../lib/theme';

export function VideoUploader() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
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
    let result = await DocumentPicker.getDocumentAsync({
      type: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0]!;
      const mime = asset.mimeType || 'video/mp4';
      if (!['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'].includes(mime)) {
        setError('Please select a supported video file (.mp4, .mov, or .webm).');
        return;
      }
      setFileUri(asset.uri);
      setFileName(asset.name || 'video.mp4');
      setFileSize(asset.size || 0);
      setMimeType(asset.mimeType || 'video/mp4');
      
      // Note: DocumentPicker doesn't provide duration, width, or height
      // The backend or VideoUploadManager handles processing these if missing
      setDuration(null);
      setWidth(null);
      setHeight(null);
      setError(null);
    }
  };

  const startUpload = async () => {
    if (!fileUri || !fileSize || !fileName || !mimeType) return;

    try {
      setError(null);
      setProgress(0);
      setStatus('initializing');

      const idempotencyKey = Date.now().toString() + Math.random().toString(36).substring(7);
      const totalParts = Math.ceil(fileSize / (8 * 1024 * 1024));

      const response = await submissionsApi.create({
        fileName: fileName,
        contentType: (mimeType || 'video/mp4') as 'video/mp4' | 'video/quicktime' | 'video/webm' | 'video/x-m4v',
        fileSize: fileSize,
        totalParts,
        country: 'United States',
        durationSeconds: duration && duration > 0 ? duration : undefined,
        width: width || undefined,
        height: height || undefined,
      }, idempotencyKey);

      const { submissionId, uploadId } = response;

      const source = new MobileUploadSource(fileUri, fileSize, mimeType);
      const manager = new VideoUploadManager({
        apiClient: apiClient,
        uploadId: uploadId,
        source,
        fileName: fileName,
        onProgress: (uploaded: number, total: number) => {
          setProgress(Math.min(100, Math.max(0, Math.round((uploaded / total) * 100))));
        },
        onStateChange: (state: unknown) => {
          setStatus(state as string);
        },
        onError: (err: Error) => {
          setError(err.message);
        },
        onComplete: (videoId: string) => {
          setStatus('completed');
          setTimeout(() => {
             setUploadManager(null);
             router.push(`/submissions/${submissionId}`);
          }, 1500); // Give user a moment to see the 100% success state
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
      setStatus('idle');
    }
  };

  const handleRetry = async () => {
    if (uploadManager) {
      setError(null);
      await uploadManager.start(); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Video</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={pickVideo}>
          <Text style={styles.buttonText}>Pick a video from gallery</Text>
        </TouchableOpacity>
        
        {fileUri && (
          <View style={styles.selectedFile}>
            <Text style={styles.fileNameText} numberOfLines={1}>Selected: {fileName}</Text>
            <TouchableOpacity style={[styles.primaryButton, styles.uploadButton]} onPress={startUpload}>
              <Text style={styles.buttonText}>Start Upload</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!uploadManager && error && (
        <Text style={styles.globalErrorText}>{error}</Text>
      )}

      {/* Upload Progress Modal */}
      <Modal
        visible={!!uploadManager}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Uploading Video</Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>{fileName}</Text>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>{status === 'completed' ? 'Done!' : `${progress}%`}</Text>
                <Text style={styles.statusLabel}>{status}</Text>
              </View>

              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: status === 'error' ? colors.danger : status === 'completed' ? colors.success : colors.primary }]} />
              </View>
            </View>

            {status === 'uploading' || status === 'created' || status === 'initializing' ? (
               <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
            ) : null}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              {status === 'error' && (
                <TouchableOpacity style={[styles.modalButton, styles.retryButton]} onPress={handleRetry}>
                  <Text style={[styles.modalButtonText, { color: colors.primaryText }]}>Retry</Text>
                </TouchableOpacity>
              )}
              {status !== 'completed' && (
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCancel}>
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: colors.text,
    textAlign: 'center',
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.text,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '600',
  },
  selectedFile: {
    marginTop: 12,
    gap: 8,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  fileNameText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  globalErrorText: {
    color: colors.danger,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  errorContainer: {
    backgroundColor: colors.danger + '26',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
  },
  retryButton: {
    backgroundColor: colors.text,
  },
  modalButtonText: {
    fontWeight: '600',
  }
});

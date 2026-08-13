import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, FlatList, ScrollView, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { VideoUploadManager } from '@repo/api-client';
import { MobileUploadSource } from '../../features/video/mobile-upload-source';
import { apiClient, submissionsApi } from '../../lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VideosScreen() {
  const router = useRouter();
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [videoAsset, setVideoAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  
  const [uploadManager, setUploadManager] = useState<VideoUploadManager | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('idle');
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const COUNTRIES = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 
    'Germany', 'France', 'Japan', 'Brazil', 'India'
  ];

  const videoSource = selectedVideoUri ? { uri: selectedVideoUri } : null;
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = isMuted;
  });

  useFocusEffect(
    useCallback(() => {
      if (selectedVideoUri && isPlaying) {
        player.play();
      }
      return () => {
        try {
          player.pause();
        } catch {
          // Ignore errors if player is already released
        }
      };
    }, [selectedVideoUri, player, isPlaying])
  );

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    player.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handlePickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant camera roll permissions to upload a video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
    });

    const asset = !result.canceled ? result.assets?.[0] : null;
    if (asset) {
      const mime = asset.mimeType || 'video/mp4';
      if (!['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'].includes(mime)) {
        Alert.alert('Unsupported Format', 'Please select a supported video file (.mp4, .mov, or .webm).');
        return;
      }
      setSelectedVideoUri(asset.uri);
      setVideoAsset(asset);
      setUploadManager(null);
      setUploadManager(null);
      setUploadStatus('idle');
      setUploadProgress(0);
      setIdempotencyKey(Date.now().toString() + Math.random().toString(36).substring(7));
    }
  };

  const handleSubmitVideo = async () => {
    if (!selectedCountry) {
      Alert.alert('Country Required', 'Please select your recording country before submitting.');
      return;
    }
    if (!selectedVideoUri || !videoAsset) {
      Alert.alert('No Video', 'Please upload a video first.');
      return;
    }

    try {
      const fileSize = videoAsset.fileSize;
      if (!fileSize || fileSize <= 0) {
        Alert.alert('Invalid Video', 'Unable to determine file size.');
        return;
      }
      const totalParts = Math.ceil(fileSize / (8 * 1024 * 1024));

      const response = await submissionsApi.create({
        fileName: videoAsset.fileName || 'video.mp4',
        contentType: (videoAsset.mimeType || 'video/mp4') as 'video/mp4' | 'video/quicktime' | 'video/webm' | 'video/x-m4v',
        fileSize: fileSize,
        totalParts,
        country: selectedCountry,
      }, idempotencyKey);

      const { uploadId } = response;

      const source = new MobileUploadSource(
        videoAsset.uri,
        fileSize,
        videoAsset.mimeType || 'video/mp4'
      );
      
      const manager = new VideoUploadManager({
        apiClient: apiClient,
        uploadId: uploadId,
        source,
        fileName: videoAsset.fileName || 'video.mp4',
        onProgress: (uploaded, total) => {
          setUploadProgress(Math.round((uploaded / total) * 100));
        },
        onStateChange: (state) => {
          setUploadStatus(state);
        },
        onError: (err) => {
          setUploadManager(null);
          if (player && player.status === 'error') {
            console.error('Video player error');
          }
          setUploadStatus('error');
          Alert.alert('Upload Failed', err.message);
        },
        onComplete: () => {
          setUploadStatus('completed');
          Alert.alert('Success', 'Video submitted successfully for review!');
          setSelectedVideoUri(null); 
          setSelectedCountry(null);
          setVideoAsset(null);
          setUploadManager(null);
          setIdempotencyKey('');
          router.push(`/submissions`);
        }
      });

      setUploadManager(manager);
      await manager.start();
    } catch (err) {
      setUploadManager(null);
      setUploadStatus('idle');
      Alert.alert('Error', err instanceof Error ? err.message : String(err));
    }
  };

  const handleCancelUpload = async () => {
    if (uploadManager) {
      await uploadManager.cancel();
      setUploadManager(null);
      setUploadProgress(0);
      setUploadStatus('idle');
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: 110 + insets.bottom }]}>
      <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
        
        {/* Main Instruction Card / Preview Box */}
        <View style={[styles.instructionCard, selectedVideoUri ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
          {selectedVideoUri ? (
            <View style={styles.videoPreviewContainer}>
              <VideoView 
                player={player} 
                style={{ width: '100%', height: '100%', borderRadius: 36 }} 
                contentFit="cover" 
                nativeControls={false}
              />
              
              {/* Overlay elements for active video */}
              <View style={styles.videoTopOverlay}>
                <View style={styles.videoSuccessBadge}>
                  <FontAwesome5 name="check-circle" size={16} color="#2eb85c" />
                  <Text style={styles.videoSuccessText}>Video Ready</Text>
                </View>
              </View>

              {/* Center Play/Pause Control */}
              <TouchableOpacity style={styles.centerControl} onPress={togglePlay} activeOpacity={0.9}>
                {!isPlaying && (
                  <View style={styles.glassButton}>
                    <FontAwesome5 name="play" size={24} color="#ffffff" style={{ marginLeft: 4 }} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Bottom Actions Row */}
              <View style={styles.videoBottomActionRow}>
                <TouchableOpacity style={styles.actionButtonSmall} onPress={toggleMute} activeOpacity={0.8}>
                  <FontAwesome5 name={isMuted ? "volume-mute" : "volume-up"} size={14} color="#111" style={styles.actionIcon} />
                  <Text style={styles.actionButtonText}>{isMuted ? "Unmute" : "Mute"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButtonSmall} activeOpacity={0.8} onPress={handlePickVideo}>
                  <FontAwesome5 name="sync-alt" size={14} color="#111" style={styles.actionIcon} />
                  <Text style={styles.actionButtonText}>Change Video</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.instructionContent} showsVerticalScrollIndicator={false}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="file-video" size={28} color="#111111" />
              </View>
              
              <Text style={styles.cardTitle}>How it works</Text>
              
              <View style={styles.stepsContainer}>
                <View style={styles.stepRow}>
                  <View style={styles.stepNumberCircle}><Text style={styles.stepNumber}>1</Text></View>
                  <View style={styles.stepTextContainer}>
                    <Text style={styles.stepTitle}>Record</Text>
                    <Text style={styles.stepDesc}>Film a short, authentic video of your daily life holding your physical visa. No scripts or editing needed.</Text>
                  </View>
                </View>

                <View style={styles.stepRow}>
                  <View style={styles.stepNumberCircle}><Text style={styles.stepNumber}>2</Text></View>
                  <View style={styles.stepTextContainer}>
                    <Text style={styles.stepTitle}>Upload</Text>
                    <Text style={styles.stepDesc}>Select your location and securely upload the raw, unedited footage directly from your phone.</Text>
                  </View>
                </View>

                <View style={styles.stepRow}>
                  <View style={styles.stepNumberCircle}><Text style={styles.stepNumber}>3</Text></View>
                  <View style={styles.stepTextContainer}>
                    <Text style={styles.stepTitle}>Get Rewarded</Text>
                    <Text style={styles.stepDesc}>If your video is selected for use, you'll receive a direct cash payment instantly to your wallet.</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.uploadButton} activeOpacity={0.8} onPress={handlePickVideo}>
                <FontAwesome5 name="file-upload" size={16} color="#ffffff" style={styles.uploadIcon} />
                <Text style={styles.uploadButtonText}>Upload Video</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Bottom Form Area */}
        <View style={styles.formArea}>
          <Text style={styles.inputLabel}>SELECT RECORDING LOCATION</Text>
          <TouchableOpacity style={styles.countrySelector} onPress={() => setShowCountryModal(true)} activeOpacity={0.8}>
            <View style={styles.countryLeft}>
              <FontAwesome5 name="globe-americas" size={18} color="#111111" />
              <Text style={[styles.countryText, !selectedCountry && styles.countryTextPlaceholder]}>
                {selectedCountry ? selectedCountry : 'Select your country'}
              </Text>
            </View>
            <FontAwesome5 name="chevron-down" size={14} color="#888" />
          </TouchableOpacity>

          {uploadManager && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 14, color: '#333', marginBottom: 5 }}>
                Uploading: {uploadProgress}% - {uploadStatus}
              </Text>
              <View style={{ height: 6, backgroundColor: '#e0e0e0', borderRadius: 3 }}>
                <View style={{ height: '100%', backgroundColor: '#2eb85c', width: `${uploadProgress}%`, borderRadius: 3 }} />
              </View>
              {uploadStatus !== 'completed' && uploadStatus !== 'error' && (
                <TouchableOpacity onPress={handleCancelUpload} style={{ marginTop: 10, alignSelf: 'center' }}>
                  <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancel Upload</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!uploadManager && (
            <TouchableOpacity 
              style={[styles.submitBtn, (!selectedCountry || !selectedVideoUri) && styles.submitBtnDisabled]} 
              activeOpacity={0.9} 
              onPress={handleSubmitVideo}
            >
              <Text style={[styles.submitBtnText, (!selectedCountry || !selectedVideoUri) && styles.submitBtnTextDisabled]}>
                Submit Verification
              </Text>
              <FontAwesome5 name="arrow-right" size={14} color={(!selectedCountry || !selectedVideoUri) ? "#999" : "#fff"} />
            </TouchableOpacity>
          )}
        </View>

      </Animated.View>

      {/* Country Selection Modal */}
      <Modal visible={showCountryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <FontAwesome5 name="times" size={20} color="#111" />
              </TouchableOpacity>
            </View>
            <FlatList 
              data={COUNTRIES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <TouchableOpacity 
                  style={styles.countryOption}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={[styles.countryOptionText, selectedCountry === item && { color: '#7c3f1b', fontWeight: '800' }]}>
                    {item}
                  </Text>
                  {selectedCountry === item && <FontAwesome5 name="check" size={16} color="#7c3f1b" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  instructionCard: {
    backgroundColor: '#ffffff', 
    borderRadius: 36,
    paddingVertical: 24,
    paddingHorizontal: 0, 
    alignItems: 'center',
    marginBottom: 20,
    flex: 1, 
    borderWidth: 1,
    borderColor: '#eaeaea'
  },
  instructionContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24, // Added back to instruction content specifically
    paddingBottom: 24,
  },
  videoPreviewContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000',
    borderRadius: 36,
    overflow: 'hidden',
  },
  videoTopOverlay: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 2,
  },
  videoBottomActionRow: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3,
  },
  centerControl: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  glassButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    height: 46, // Explicit fixed height guarantees they are perfectly identical
    paddingHorizontal: 20,
    borderRadius: 23,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 0.2,
  },
  videoSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  videoSuccessText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  stepNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  uploadButton: {
    backgroundColor: '#111111', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 10,
    marginBottom: 0,
  },
  uploadIcon: {
    marginRight: 10,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  formArea: {
    paddingHorizontal: 4,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 20,
  },
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginLeft: 14,
  },
  countryTextPlaceholder: {
    color: '#999',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#eee',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 10,
  },
  submitBtnTextDisabled: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },
  countryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
});

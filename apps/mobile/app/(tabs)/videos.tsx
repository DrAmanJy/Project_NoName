import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, FlatList, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useFocusEffect } from 'expo-router';

export default function VideosScreen() {
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);

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
        } catch (e) {
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

    if (!result.canceled) {
      setSelectedVideoUri(result.assets[0].uri);
    }
  };

  const handleSubmitVideo = () => {
    if (!selectedCountry) {
      Alert.alert('Country Required', 'Please select your recording country before submitting.');
      return;
    }
    if (!selectedVideoUri) {
      Alert.alert('No Video', 'Please upload a video first.');
      return;
    }
    Alert.alert('Success', 'Video submitted successfully for review!');
    setSelectedVideoUri(null); 
    setSelectedCountry(null);
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.mainContainer}>
        
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
            <View style={styles.instructionContent}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="file-video" size={28} color="#5a2e17" />
              </View>
              
              <Text style={styles.cardTitle}>How it works</Text>
              
              <View style={styles.stepsContainer}>
                <Text style={styles.stepText}>
                  <Text style={{fontWeight: '800'}}>1.</Text> Record a clear video holding your physical visa document in frame.
                </Text>
                <Text style={styles.stepText}>
                  <Text style={{fontWeight: '800'}}>2.</Text> Clearly read the script below directly into the camera.
                </Text>
                
                <View style={styles.scriptBox}>
                  <Text style={styles.scriptTitle}>REQUIRED SCRIPT (30 SEC):</Text>
                  <Text style={styles.scriptContent}>
                    "My name is [Your Name], and I am recording this video on [Today's Date]. I am currently located in [Your Country]. I confirm that I am holding my official physical visa in frame. I understand this video is strictly for verification."
                  </Text>
                </View>

                <Text style={styles.stepText}>
                  <Text style={{fontWeight: '800'}}>3.</Text> Verify your current recording country and submit the file below.
                </Text>
              </View>

              <TouchableOpacity style={styles.uploadButton} activeOpacity={0.8} onPress={handlePickVideo}>
                <FontAwesome5 name="file-upload" size={16} color="#ffffff" style={styles.uploadIcon} />
                <Text style={styles.uploadButtonText}>Upload Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Form Area */}
        <View style={styles.formArea}>
          <Text style={styles.inputLabel}>RECORDING LOCATION</Text>
          <TouchableOpacity style={styles.countrySelector} onPress={() => setShowCountryModal(true)} activeOpacity={0.8}>
            <View style={styles.countryLeft}>
              <FontAwesome5 name="globe-americas" size={18} color="#934d28" />
              <Text style={[styles.countryText, !selectedCountry && styles.countryTextPlaceholder]}>
                {selectedCountry ? selectedCountry : 'Select your country'}
              </Text>
            </View>
            <FontAwesome5 name="chevron-down" size={14} color="#888" />
          </TouchableOpacity>

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
        </View>

      </View>

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
    paddingBottom: 110, // Hard stop before custom menu
  },
  instructionCard: {
    backgroundColor: '#fef1e6', 
    borderRadius: 36,
    paddingVertical: 24,
    paddingHorizontal: 0, // Removed so inner content can dictate padding or hit edges
    alignItems: 'center',
    marginBottom: 20,
    flex: 1, 
  },
  instructionContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24, // Added back to instruction content specifically
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
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: '#fcdcc5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#3d1c00',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 40,
    flex: 1,
  },
  stepText: {
    fontSize: 15,
    color: '#5c3316',
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  scriptBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#fcdcc5',
    shadowColor: '#5a2e17',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  scriptTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#934d28',
    marginBottom: 10,
    letterSpacing: 1,
  },
  scriptContent: {
    fontSize: 15,
    color: '#3d1c00',
    lineHeight: 26,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#7c3f1b', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    shadowColor: '#7c3f1b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
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

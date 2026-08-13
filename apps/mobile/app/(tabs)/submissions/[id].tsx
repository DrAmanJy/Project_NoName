import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import type { SubmissionResponse } from '@repo/contracts';
import { submissionsApi } from '../../../lib/api';
import { useVideoPlayer, VideoView } from 'expo-video';

function VideoPlayer({ url }: { url: string }) {
  const player = useVideoPlayer(url, player => {
    player.loop = false;
  });

  return (
    <VideoView style={styles.videoPlayer} player={player} />
  );
}

function TimelineStep({ 
  icon, 
  iconColor, 
  iconBgColor, 
  title, 
  subtitle, 
  isLast = false, 
  isActive = true 
}: {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle: string;
  isLast?: boolean;
  isActive?: boolean;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineIconContainer, { backgroundColor: iconBgColor }]}>
          <FontAwesome5 name={icon} size={12} color={iconColor} />
        </View>
        {!isLast && (
          <View style={[styles.timelineLine, !isActive && styles.timelineLineInactive]} />
        )}
      </View>
      <View style={styles.timelineRight}>
        <Text style={[styles.stepTitle, !isActive && { color: '#aaaaaa' }]}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

export default function SubmissionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const data = await submissionsApi.get(id as string);
        if (isActive) {
          setSubmission(data);
          setError(null);
        }
      } catch {
        if (isActive) {
          setError('Failed to load submission details.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };
    if (id) fetchSubmission();
    return () => { isActive = false; };
  }, [id]);

  const renderStatusTag = (status: string) => {
    switch (status.toUpperCase()) {
      case 'IN_REVIEW':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#a86532' }}>In Review</Text></Text>;
      case 'REJECTED':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#e55353' }}>Rejected</Text></Text>;
      case 'PAID':
      case 'APPROVED':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#2eb85c' }}>Approved</Text></Text>;
      default:
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#666666' }}>{status}</Text></Text>;
    }
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#934d28" />
        <Text style={styles.loadingText}>Loading submission...</Text>
      </View>
    );
  }

  if (error || !submission) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#e55353' }}>{error || 'Submission not found'}</Text>
      </View>
    );
  }

  const isRejected = submission.status === 'rejected';

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {submission.video?.previewUrl ? (
          <View style={styles.previewContainer}>
            <VideoPlayer url={submission.video.previewUrl} />
          </View>
        ) : (
          <View style={styles.placeholderVideo}>
            <FontAwesome5 name="video-slash" size={32} color="#cccccc" />
          </View>
        )}

        <View style={styles.submissionCard}>
          <View style={styles.submissionHeader}>
            <View style={[
              styles.headerIconContainer, 
              { backgroundColor: isRejected ? '#e55353' : '#a86532' }
            ]}>
              <FontAwesome5 
                name={isRejected ? 'exclamation-triangle' : 'video'} 
                size={12} 
                color="#ffffff" 
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.submissionTitle} numberOfLines={1}>
                Submission - {new Date(submission.createdAt).toLocaleDateString()}
              </Text>
              {renderStatusTag(submission.status)}
            </View>
          </View>

          <View style={styles.timelineContainer}>
            <TimelineStep
              icon="check"
              iconColor="#ffffff"
              iconBgColor="#2eb85c"
              title="Uploaded"
              subtitle="Video uploaded successfully"
              isActive={true}
            />
            {submission.verification && (
              <TimelineStep
                icon={submission.verification.overallStatus === 'pass' ? 'check' : (submission.verification.overallStatus === 'fail' ? 'times' : 'ellipsis-h')}
                iconColor="#ffffff"
                iconBgColor={submission.verification.overallStatus === 'pass' ? '#2eb85c' : (submission.verification.overallStatus === 'fail' ? '#e55353' : '#a86532')}
                title="AI Verification"
                subtitle={`Status: ${submission.verification.overallStatus}`}
                isActive={true}
              />
            )}
            <TimelineStep
              icon={isRejected ? "times" : (submission.status === 'approved' ? "check" : "ellipsis-h")}
              iconColor={isRejected || submission.status === 'approved' ? "#ffffff" : "#999999"}
              iconBgColor={isRejected ? "#e55353" : (submission.status === 'approved' ? "#2eb85c" : "#f0f0f0")}
              title="Final Decision"
              subtitle={isRejected ? "Rejected" : (submission.status === 'approved' ? "Approved" : "Pending review")}
              isLast={true}
              isActive={isRejected || submission.status === 'approved'}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  loadingText: { marginTop: 10, color: '#8c7b6e', fontWeight: '600' },
  previewContainer: { marginBottom: 20, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000' },
  videoPlayer: { width: '100%', height: 220 },
  placeholderVideo: { width: '100%', height: 220, backgroundColor: '#f2f2f2', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  submissionCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#f2f2f2', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 },
  submissionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  headerIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  headerTextContainer: { flex: 1, justifyContent: 'center' },
  submissionTitle: { fontSize: 16, fontWeight: '800', color: '#111111', marginBottom: 4, letterSpacing: -0.3 },
  submissionStatus: { fontSize: 13, color: '#888888', fontWeight: '600' },
  timelineContainer: { paddingLeft: 4 },
  timelineRow: { flexDirection: 'row', minHeight: 60 },
  timelineLeft: { width: 32, alignItems: 'center', marginRight: 20 },
  timelineIconContainer: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#e5e5e5', marginVertical: 4 },
  timelineLineInactive: { backgroundColor: '#f5f5f5', borderStyle: 'dashed' },
  timelineRight: { flex: 1, paddingBottom: 28, paddingTop: 4 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#111111', marginBottom: 4, letterSpacing: -0.2 },
  stepSubtitle: { fontSize: 13, color: '#888888', fontWeight: '500' },
});

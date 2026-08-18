import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import type { SubmissionResponse } from '@repo/contracts';
import { submissionsApi } from '../../../lib/api';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../../../lib/theme';

function VideoPlayer({ url }: { url: string }) {
  const player = useVideoPlayer(url, player => {
    player.loop = false;
  });

  return (
    <View style={{ width: '100%', aspectRatio: 9/16, overflow: 'hidden', borderRadius: 24, backgroundColor: '#000' }}>
      <VideoView 
        style={{ width: '100%', height: '100%' }}
        player={player} 
        nativeControls={true}
        contentFit="cover"
      />
    </View>
  );
}

function TimelineStep({ 
  icon, 
  iconColor, 
  iconBgColor, 
  title, 
  subtitle, 
  isLast = false, 
  isActive = true,
  colors
}: {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle: string;
  isLast?: boolean;
  isActive?: boolean;
  colors: any;
}) {
  const styles = getStyles(colors);
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
        <Text style={[styles.stepTitle, !isActive && { color: colors.textMuted }]}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

export default function SubmissionDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = getStyles(colors);
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
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: colors.warning }}>In Review</Text></Text>;
      case 'REJECTED':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: colors.danger }}>Rejected</Text></Text>;
      case 'PAID':
      case 'APPROVED':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: colors.success }}>Approved</Text></Text>;
      default:
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: colors.textSecondary }}>{status}</Text></Text>;
    }
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading submission...</Text>
      </View>
    );
  }

  if (error || !submission) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.danger }}>{error || 'Submission not found'}</Text>
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
            <FontAwesome5 name="video-slash" size={32} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.submissionCard}>
          <View style={styles.submissionHeader}>
            <View style={[
              styles.headerIconContainer, 
              { backgroundColor: isRejected ? colors.danger + '26' : (submission.status === 'approved' || submission.status === 'paid' ? colors.success + '26' : colors.warning + '26') }
            ]}>
              <FontAwesome5 
                name={isRejected ? 'exclamation-triangle' : (submission.status === 'approved' || submission.status === 'paid' ? 'check' : 'video')} 
                size={14} 
                color={isRejected ? colors.danger : (submission.status === 'approved' || submission.status === 'paid' ? colors.success : colors.warning)} 
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
              colors={colors}
              icon="cloud-upload-alt"
              iconColor="#ffffff"
              iconBgColor={colors.success}
              title="Uploaded"
              subtitle="Video uploaded successfully"
              isActive={true}
            />
            {(submission as unknown as { verification?: { overallStatus?: string } }).verification && (
              <TimelineStep
                colors={colors}
                icon={(submission as unknown as { verification?: { overallStatus?: string } }).verification?.overallStatus === 'pass' ? 'robot' : ((submission as unknown as { verification?: { overallStatus?: string } }).verification?.overallStatus === 'fail' ? 'exclamation-circle' : 'hourglass-half')}
                iconColor="#ffffff"
                iconBgColor={(submission as unknown as { verification?: { overallStatus?: string } }).verification?.overallStatus === 'pass' ? colors.success : ((submission as unknown as { verification?: { overallStatus?: string } }).verification?.overallStatus === 'fail' ? colors.danger : colors.warning)}
                title="AI Verification"
                subtitle={`Status: ${(submission as unknown as { verification?: { overallStatus?: string } }).verification?.overallStatus}`}
                isActive={true}
              />
            )}
            <TimelineStep
              colors={colors}
              icon={isRejected ? "exclamation-circle" : (submission.status === 'approved' || submission.status === 'paid' ? "check-double" : "hourglass-half")}
              iconColor="#ffffff"
              iconBgColor={isRejected ? colors.danger : (submission.status === 'approved' || submission.status === 'paid' ? colors.success : colors.warning)}
              title="Final Decision"
              subtitle={isRejected ? (submission.rejectionReason || "Rejected") : (submission.status === 'approved' || submission.status === 'paid' ? "Approved" : "Pending review")}
              isLast={true}
              isActive={isRejected || submission.status === 'approved' || submission.status === 'paid'}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  loadingText: { marginTop: 10, color: colors.textSecondary, fontWeight: '600' },
  previewContainer: { marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 4 },
  videoPlayer: { width: '100%', height: '100%' },
  controlsOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
    elevation: 10,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  placeholderVideo: { width: '100%', aspectRatio: 9/16, backgroundColor: colors.iconBg, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  submissionCard: { backgroundColor: colors.card, borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 15, elevation: 2 },
  submissionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  headerIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  headerTextContainer: { flex: 1, justifyContent: 'center' },
  submissionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4, letterSpacing: -0.3 },
  submissionStatus: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  timelineContainer: { paddingLeft: 4 },
  timelineRow: { flexDirection: 'row', minHeight: 60 },
  timelineLeft: { width: 32, alignItems: 'center', marginRight: 20 },
  timelineIconContainer: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  timelineLineInactive: { backgroundColor: colors.iconBg, borderStyle: 'dashed' },
  timelineRight: { flex: 1, paddingBottom: 28, paddingTop: 4 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4, letterSpacing: -0.2 },
  stepSubtitle: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
});

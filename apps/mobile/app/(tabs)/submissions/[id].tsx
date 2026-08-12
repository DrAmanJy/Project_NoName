import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
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
      } catch (err) {
        if (isActive) {
          console.error('Failed to fetch submission details', err);
          setError('Failed to load submission details.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };
    if (id) {
      fetchSubmission();
    }
    return () => {
      isActive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading submission...</Text>
      </View>
    );
  }

  if (error || !submission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error || 'Submission not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Submission Detail</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        <View style={styles.row}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.value}>{submission.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { textTransform: 'capitalize', color: '#0055ff', fontWeight: 'bold' }]}>
            {submission.status.replace('_', ' ')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Submitted:</Text>
          <Text style={styles.value}>
            {new Date(submission.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
      
      {submission.verification && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Verification</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Overall Result:</Text>
            <Text style={[styles.value, { 
              fontWeight: 'bold', textTransform: 'uppercase',
              color: submission.verification.overallStatus === 'pass' ? 'green' : 
                     submission.verification.overallStatus === 'fail' ? 'red' : 'orange'
            }]}>
              {submission.verification.overallStatus}
            </Text>
          </View>
        </View>
      )}

      {submission.video && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Video Details</Text>
          
          <View style={styles.previewContainer}>
            {submission.video.previewUrl ? (
              <VideoPlayer url={submission.video.previewUrl} />
            ) : (
              <View style={styles.placeholderVideo}>
                <Text style={styles.placeholderText}>
                  {submission.video.uploadStatus === 'uploading' 
                    ? 'Video is currently uploading...' 
                    : 'Preview not available'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Original File:</Text>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
              {submission.video.originalFilename}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>MIME Type:</Text>
            <Text style={styles.value}>{submission.video.mimeType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>File Size:</Text>
            <Text style={styles.value}>
              {(submission.video.sizeBytes / (1024 * 1024)).toFixed(2)} MB
            </Text>
          </View>
          
          {submission.video.durationSeconds != null && (
            <View style={styles.row}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>{Math.round(submission.video.durationSeconds)}s</Text>
            </View>
          )}
          
          {submission.video.width && submission.video.height && (
            <View style={styles.row}>
              <Text style={styles.label}>Resolution:</Text>
              <Text style={styles.value}>{submission.video.width} × {submission.video.height}</Text>
            </View>
          )}
          
          <View style={styles.row}>
            <Text style={styles.label}>Upload Status:</Text>
            <Text style={[styles.value, { textTransform: 'capitalize' }]}>
              {submission.video.uploadStatus}
            </Text>
          </View>
        </View>
      )}
      
      <Text style={styles.subtitle}>Timeline</Text>
      {submission.timeline && submission.timeline.length > 0 ? (
        submission.timeline.map((step, idx) => (
          <View key={step.key} style={styles.timelineStep}>
            <Text style={styles.stepTitle}>
              {idx + 1}. {step.key.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.stepStatus}>Status: {step.status}</Text>
            {step.message && <Text style={styles.stepMessage}>{step.message}</Text>}
            {step.completedAt && (
              <Text style={styles.stepTime}>
                Completed: {new Date(step.completedAt).toLocaleString()}
              </Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.emptyTimeline}>No timeline available.</Text>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#444',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
    flex: 1,
  },
  value: {
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  timelineStep: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  stepTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  stepStatus: {
    color: '#666',
    textTransform: 'capitalize',
  },
  stepMessage: {
    color: '#d97706',
    marginTop: 4,
    fontStyle: 'italic',
  },
  stepTime: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  emptyTimeline: {
    color: '#666',
    fontStyle: 'italic',
  },
  previewContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: 200,
  },
  placeholderVideo: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#888',
  }
});

import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import type { SubmissionResponse } from '@repo/contracts';
import { submissionsApi } from '../../../lib/api';

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
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{submission.id}</Text>
        
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, { textTransform: 'capitalize' }]}>
          {submission.status.replace('_', ' ')}
        </Text>
        
        <Text style={styles.label}>Created At:</Text>
        <Text style={styles.value}>
          {new Date(submission.createdAt).toLocaleString()}
        </Text>
      </View>
      
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', margin: 16, marginBottom: 8 },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#888', marginTop: 12, textTransform: 'uppercase' },
  value: { fontSize: 16, marginTop: 4, color: '#333' },
  timelineStep: { backgroundColor: '#fff', padding: 12, marginHorizontal: 16, marginBottom: 8, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  stepTitle: { fontSize: 14, fontWeight: 'bold' },
  stepStatus: { fontSize: 14, color: '#666', marginTop: 4, textTransform: 'capitalize' },
  stepMessage: { fontSize: 14, color: '#e67e22', marginTop: 4, fontStyle: 'italic' },
  stepTime: { fontSize: 12, color: '#999', marginTop: 4 },
  emptyTimeline: { marginHorizontal: 16, color: '#666', fontStyle: 'italic' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  errorText: { fontSize: 16, color: '#e74c3c' },
});

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import type { SubmissionResponse } from '@repo/contracts';
import { submissionsApi } from '../../../lib/api';

export default function SubmissionsListScreen() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchSubmissions = async () => {
        try {
          setLoading(true);
          const response = await submissionsApi.list(1, 50);
          if (isActive) {
            setSubmissions(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch submissions', error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchSubmissions();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const renderItem = ({ item }: { item: SubmissionResponse }) => {
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/submissions/${item.id}`)}
      >
        <Text style={styles.title}>Submission - {new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.status}>Status: {item.status.replace('_', ' ')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading && submissions.length === 0 ? (
        <Text style={styles.loading}>Loading submissions...</Text>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No submissions yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  list: { padding: 16 },
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  status: { fontSize: 14, color: '#666', textTransform: 'capitalize' },
  loading: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
});

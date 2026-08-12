import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import type { SubmissionResponse } from '@repo/contracts';

// Placeholder for fetching
export default function SubmissionsListScreen() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    // API client call goes here
  }, []);

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
      <FlatList
        data={submissions}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
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
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 14, color: '#666', marginTop: 4, textTransform: 'capitalize' },
});

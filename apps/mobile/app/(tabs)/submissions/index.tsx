import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import type { SubmissionResponse } from '@repo/contracts';
import { submissionsApi } from '../../../lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TimelineStepProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle: string;
  isLast?: boolean;
  isActive?: boolean;
}

function TimelineStep({ icon, iconColor, iconBgColor, title, subtitle, isLast = false, isActive = true }: TimelineStepProps) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineIconContainer, { backgroundColor: iconBgColor }]}>
          <FontAwesome5 name={icon} size={12} color={iconColor} />
        </View>
        {!isLast && <View style={[styles.timelineLine, !isActive && styles.timelineLineInactive]} />}
      </View>
      <View style={[styles.timelineRight, !isActive && { opacity: 0.6 }]}>
        <Text style={[styles.stepTitle, !isActive && { color: '#666666' }]}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

export default function SubmissionsListScreen() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

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

  const totalEarnedAmount = submissions
    .filter((v) => v.status === 'paid' || v.status === 'approved')
    .reduce((acc, v) => acc + (v.earning || 0), 0) / 100;
    
  const pendingEarnedAmount = submissions
    .filter((v) => v.status === 'in_review' || v.status === 'draft')
    .reduce((acc, v) => acc + (v.expectedEarning || 0), 0) / 100;

  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'IN_REVIEW':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#a86532' }}>In Review</Text></Text>;
      case 'REJECTED':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#e55353' }}>Rejected</Text></Text>;
      case 'PAID':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#2eb85c' }}>Paid</Text></Text>;
      default:
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#666666' }}>{status}</Text></Text>;
    }
  };

  const renderTimeline = (video: SubmissionResponse) => {
    if (video.status === 'in_review') {
      return (
        <View style={styles.timelineContainer}>
          <TimelineStep
            icon="check"
            iconColor="#ffffff"
            iconBgColor="#2eb85c"
            title="Video Uploaded"
            subtitle="Processing completed"
          />
          <TimelineStep
            icon="ellipsis-h"
            iconColor="#ffffff"
            iconBgColor="#a86532"
            title="Under Review"
            subtitle="Usually takes 24-48 hours"
          />
          <TimelineStep
            icon="wallet"
            iconColor="#666666"
            iconBgColor="#222222"
            title="Payment"
            subtitle="Pending approval"
            isLast={true}
            isActive={false}
          />
        </View>
      );
    }
    
    if (video.status === 'rejected') {
      return (
        <View style={styles.timelineContainer}>
          <TimelineStep
            icon="check"
            iconColor="#ffffff"
            iconBgColor="#2eb85c"
            title="Video Uploaded"
            subtitle="Received successfully"
          />
          <TimelineStep
            icon="times"
            iconColor="#ffffff"
            iconBgColor="#e55353"
            title="Rejected"
            subtitle="Content did not meet guidelines"
            isLast={true}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Earnings Card */}
        <Animated.View style={[styles.earningsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.earningsLabel}>Expected Earnings</Text>
            <Text style={styles.earningsAmount}>₹{pendingEarnedAmount.toFixed(2)}</Text>
            <View style={styles.earningsPill}>
              <Text style={styles.earningsPillText}>Total Earned: ₹{totalEarnedAmount.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.walletIconContainer}>
            <FontAwesome5 name="wallet" size={24} color="#f59e0b" />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.sectionTitle, { opacity: fadeAnim }]}>My Submissions</Animated.Text>

        {loading && submissions.length === 0 ? (
          <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 40 }} />
        ) : (
          submissions.map((submission) => (
            <Animated.View 
              key={submission.id}
              style={{ 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }] 
              }}
            >
              <TouchableOpacity 
                style={styles.submissionCard}
                onPress={() => router.push(`/submissions/${submission.id}`)}
                activeOpacity={0.7}
              >
              <View style={styles.submissionHeader}>
                <View style={[
                  styles.headerIconContainer, 
                  { backgroundColor: submission.status === 'rejected' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(217, 119, 6, 0.15)' }
                ]}>
                  <FontAwesome5 
                    name={submission.status === 'rejected' ? 'exclamation-triangle' : 'video'} 
                    size={14} 
                    color={submission.status === 'rejected' ? '#ef4444' : '#f59e0b'} 
                  />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.submissionTitle} numberOfLines={1}>
                    Submission - {new Date(submission.createdAt).toLocaleDateString()}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {renderStatusTag(submission.status.toUpperCase())}
                    <Text style={styles.submissionEarning}>
                      {submission.status === 'paid' || submission.status === 'approved' ? `Earned: ₹${((submission.earning || 0) / 100).toFixed(2)}` : `Expected: ₹${((submission.expectedEarning || 0) / 100).toFixed(2)}`}
                    </Text>
                  </View>
                </View>
              </View>
              {renderTimeline(submission)}
            </TouchableOpacity>
            </Animated.View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  earningsCard: {
    backgroundColor: '#161616', // Dark premium look
    borderRadius: 32,
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 36,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  earningsAmount: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  earningsPill: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  earningsPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4ade80', // Emerald green
  },
  walletIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  submissionCard: {
    backgroundColor: '#161616',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 4,
  },
  submissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  submissionStatus: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
  },
  submissionEarning: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '700',
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    width: 32,
    alignItems: 'center',
    marginRight: 20,
  },
  timelineIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#333333',
    marginVertical: 4,
  },
  timelineLineInactive: {
    backgroundColor: '#222222',
    borderStyle: 'dashed',
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 28,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
  },
});

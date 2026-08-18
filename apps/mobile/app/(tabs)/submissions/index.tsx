import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import type { SubmissionResponse } from '@repo/contracts';
import { submissionsApi } from '../../../lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../lib/theme';

export default function SubmissionsListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
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

  const renderStatusTag = (submission: SubmissionResponse) => {
    const status = submission.status.toUpperCase();
    if (submission.status === 'rejected') {
      return (
        <Text style={[styles.submissionStatus, { color: colors.danger }]} numberOfLines={1}>
          {status}
        </Text>
      );
    }
    return <Text style={styles.submissionStatus}>{status.replace('_', ' ')}</Text>;
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Earnings Card */}
        <Animated.View style={[styles.earningsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.earningsLabel}>Expected Earnings</Text>
            <Text style={styles.earningsAmount}>${pendingEarnedAmount.toFixed(2)}</Text>
            <View style={styles.earningsPill}>
              <Text style={styles.earningsPillText}>Total Earned: ${totalEarnedAmount.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.walletIconContainer}>
            <FontAwesome5 name="wallet" size={24} color={colors.success} />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.sectionTitle, { opacity: fadeAnim }]}>My Submissions</Animated.Text>

        {loading && submissions.length === 0 ? (
          <ActivityIndicator size="large" color={colors.text} style={{ marginTop: 40 }} />
        ) : (
          submissions.map((submission) => (
            <Animated.View 
              key={submission.id}
              style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >
              <TouchableOpacity 
                style={styles.submissionCard}
                onPress={() => router.push(`/submissions/${submission.id}`)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.headerIconContainer, 
                  { backgroundColor: submission.status === 'rejected' ? colors.danger + '1A' : (submission.status === 'approved' || submission.status === 'paid' ? colors.success + '1A' : colors.warning + '1A') }
                ]}>
                  <FontAwesome5 
                    name={submission.status === 'rejected' ? 'exclamation-triangle' : (submission.status === 'approved' || submission.status === 'paid' ? 'check' : 'video')} 
                    size={18} 
                    color={submission.status === 'rejected' ? colors.danger : (submission.status === 'approved' || submission.status === 'paid' ? colors.success : colors.warning)} 
                  />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.submissionTitle} numberOfLines={1}>
                    Submission
                  </Text>
                  <Text style={styles.submissionDate}>
                    {new Date(submission.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                
                <View style={styles.rightContentContainer}>
                  {submission.status !== 'rejected' && (
                    <Text style={styles.submissionEarning}>
                      {submission.status === 'paid' || submission.status === 'approved' 
                        ? `+$${((submission.earning || 0) / 100).toFixed(2)}` 
                        : `~$${((submission.expectedEarning || 0) / 100).toFixed(2)}`}
                    </Text>
                  )}
                  {renderStatusTag(submission)}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  earningsCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 8,
  },
  earningsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -1,
  },
  earningsPill: {
    backgroundColor: colors.success + '26', // 15% opacity
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.success + '4D', // 30% opacity
  },
  earningsPillText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '700',
  },
  walletIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success + '1A', // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success + '33', // 20% opacity
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  submissionCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
  },
  headerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  submissionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  submissionDate: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  rightContentContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  submissionEarning: {
    fontSize: 15,
    color: colors.success,
    fontWeight: '800',
  },
  submissionStatus: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  timelineLineInactive: {
    backgroundColor: colors.iconBg,
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
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  stepSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

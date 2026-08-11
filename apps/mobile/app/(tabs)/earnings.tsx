import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import type { Video, VideoStatus } from '@repo/contracts';

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

// Mock data strictly matching the backend VideoSchema
const mockVideos: Video[] = [
  {
    id: 'vid_123',
    title: 'Submission - Aug 11',
    status: 'UNDER_REVIEW',
    userId: 'mock-user-1',
    fileKey: 'uploads/vid_123.mp4',
    fileSize: 1024000,
    mimeType: 'video/mp4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vid_456',
    title: 'Submission - Aug 10',
    status: 'REJECTED',
    userId: 'mock-user-1',
    fileKey: 'uploads/vid_456.mp4',
    fileSize: 2048000,
    mimeType: 'video/mp4',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 40000000).toISOString(),
  },
];

export default function StatusScreen() {
  const renderStatusTag = (status: VideoStatus) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#a86532' }}>In Review</Text></Text>;
      case 'REJECTED':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#e55353' }}>Rejected</Text></Text>;
      case 'PAID':
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#2eb85c' }}>Paid</Text></Text>;
      default:
        return <Text style={styles.submissionStatus}>Status: <Text style={{ color: '#666666' }}>{status}</Text></Text>;
    }
  };

  const renderTimeline = (video: Video) => {
    if (video.status === 'UNDER_REVIEW') {
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
            iconColor="#999999"
            iconBgColor="#f0f0f0"
            title="Payment"
            subtitle="Pending approval"
            isLast={true}
            isActive={false}
          />
        </View>
      );
    }
    
    if (video.status === 'REJECTED') {
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
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <View>
            <Text style={styles.earningsLabel}>Expected Earnings</Text>
            <Text style={styles.earningsAmount}>$25.00</Text>
            <View style={styles.earningsPill}>
              <Text style={styles.earningsPillText}>+ $5.00 this week</Text>
            </View>
          </View>
          <View style={styles.walletIconContainer}>
            <FontAwesome5 name="wallet" size={24} color="#934d28" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>My Submissions</Text>

        {mockVideos.map((video) => (
          <View key={video.id} style={styles.submissionCard}>
            <View style={styles.submissionHeader}>
              <View style={[
                styles.headerIconContainer, 
                { backgroundColor: video.status === 'REJECTED' ? '#e55353' : '#a86532' }
              ]}>
                <FontAwesome5 
                  name={video.status === 'REJECTED' ? 'exclamation-triangle' : 'video'} 
                  size={12} 
                  color="#ffffff" 
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.submissionTitle} numberOfLines={1}>{video.title}</Text>
                {renderStatusTag(video.status)}
              </View>
            </View>
            {renderTimeline(video)}
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120, // Leave room for custom tab bar
  },
  earningsCard: {
    backgroundColor: '#fffdf9',
    borderRadius: 32,
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 36,
    borderWidth: 1,
    borderColor: '#f2eae0',
    shadowColor: '#934d28',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  earningsLabel: {
    fontSize: 13,
    color: '#8c7b6e',
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  earningsAmount: {
    fontSize: 44,
    fontWeight: '900',
    color: '#3d2516',
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  earningsPill: {
    backgroundColor: '#f5efe6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  earningsPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#934d28',
  },
  walletIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#934d28',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  submissionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  submissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    color: '#111111',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  submissionStatus: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
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
    backgroundColor: '#e5e5e5',
    marginVertical: 4,
  },
  timelineLineInactive: {
    backgroundColor: '#f5f5f5',
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
    color: '#111111',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
  },
});

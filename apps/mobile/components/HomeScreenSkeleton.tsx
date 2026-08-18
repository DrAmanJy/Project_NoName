import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { useTheme } from '../lib/theme';

export function HomeScreenSkeleton() {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const { colors } = useTheme();
  const styles = getStyles(colors);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Primary Hero Card */}
        <Animated.View style={[styles.heroCard, { opacity: fadeAnim }]}>
          <View style={styles.heroHeader}>
            <View style={styles.skeletonCircle} />
            <View style={styles.skeletonBadge} />
          </View>
          <View style={[styles.skeletonText, { width: '80%', height: 32, marginBottom: 8 }]} />
          <View style={[styles.skeletonText, { width: '60%', height: 32, marginBottom: 16 }]} />
          
          <View style={[styles.skeletonText, { width: '100%', height: 16, marginBottom: 6 }]} />
          <View style={[styles.skeletonText, { width: '90%', height: 16, marginBottom: 28 }]} />
          
          <View style={styles.skeletonButton} />
        </Animated.View>

        {/* Why Creators Trust Us */}
        <View style={styles.sectionContainer}>
          <Animated.View style={[styles.skeletonText, { width: '60%', height: 26, alignSelf: 'center', opacity: fadeAnim, marginBottom: 8 }]} />
          <Animated.View style={[styles.skeletonText, { width: '80%', height: 16, alignSelf: 'center', opacity: fadeAnim, marginBottom: 24 }]} />

          {[1, 2, 3].map((key) => (
            <Animated.View key={key} style={[styles.trustCard, { opacity: fadeAnim }]}>
              <View style={styles.skeletonIconCircle} />
              <View style={styles.trustTextContent}>
                <View style={[styles.skeletonText, { width: '50%', height: 16, marginBottom: 8 }]} />
                <View style={[styles.skeletonText, { width: '100%', height: 14 }]} />
              </View>
            </Animated.View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 130,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 36,
    padding: 28,
    marginHorizontal: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  skeletonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.iconBg,
    marginRight: 12,
  },
  skeletonBadge: {
    width: 100,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  skeletonText: {
    backgroundColor: colors.border,
    borderRadius: 8,
  },
  skeletonButton: {
    width: '100%',
    height: 56,
    borderRadius: 30,
    backgroundColor: colors.primary + '80', // 50% opacity primary
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 48,
  },
  trustCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  skeletonIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.iconBg,
    marginRight: 16,
  },
  trustTextContent: {
    flex: 1,
  },
});

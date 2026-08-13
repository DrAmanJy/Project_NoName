import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, ScrollView } from 'react-native';
import { useAuth } from '../../features/auth/auth-provider';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  
  const insets = useSafeAreaInsets();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 110 + insets.bottom }]}
      >
        
        {/* Top Navigation / Logo Bar */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIconBg}>
              <FontAwesome5 name="video" size={14} color="#ffffff" />
            </View>
            <Text style={styles.logoText}>TRUE SERVICES</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => signOut()} 
              style={styles.avatarButton}
              activeOpacity={0.7}
            >
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarSmall} />
              ) : (
                <FontAwesome5 name="user" size={16} color="#666666" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main Content Wrapper - Flex to fill screen */}
        <View style={styles.mainContentWrapper}>
          
          {/* Profile Greeting */}
          <Animated.View style={[styles.greetingContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.greetingText}>Welcome,</Text>
            <Text style={styles.userName}>{user?.name || 'Creator'}</Text>
          </Animated.View>

        {/* Bento Grid */}
        <Animated.View style={[styles.bentoGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Main Hero Widget */}
          <View style={styles.bentoHero}>
            <View style={styles.heroBadge}>
              <FontAwesome5 name="bolt" size={12} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.heroBadgeText}>TRUE SERVICES</Text>
            </View>
            <Text style={styles.heroTitle}>Your Life Is Already Content. Get Paid For It.</Text>
            <Text style={styles.heroSubtitle}>Upload short lifestyle videos. No followers needed. No editing required. Just real moments, rewarded with real cash.</Text>
          </View>

          {/* Sub Widgets Row */}
          <View style={styles.bentoRow}>
            {/* Widget 1 */}
            <View style={styles.bentoSquare}>
              <View style={styles.widgetIconContainer}>
                <FontAwesome5 name="video" size={16} color="#111111" />
              </View>
              <Text style={styles.widgetTitle}>Record</Text>
              <Text style={styles.widgetDesc}>Capture authentic, unedited daily life.</Text>
            </View>

            {/* Widget 2 */}
            <View style={styles.bentoSquare}>
              <View style={styles.widgetIconContainer}>
                <FontAwesome5 name="id-card" size={16} color="#111111" />
              </View>
              <Text style={styles.widgetTitle}>Verify</Text>
              <Text style={styles.widgetDesc}>Show your visa clearly in the shot.</Text>
            </View>
          </View>

          {/* Full Width Bottom Widget */}
          <View style={styles.bentoFull}>
            <View style={styles.bentoFullLeft}>
              <View style={styles.widgetIconContainerDark}>
                <FontAwesome5 name="wallet" size={18} color="#ffffff" />
              </View>
              <View style={styles.bentoFullText}>
                <Text style={styles.widgetTitle}>Get Rewarded</Text>
                <Text style={styles.widgetDesc}>Approved videos pay out instantly.</Text>
              </View>
            </View>
          </View>

        </Animated.View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9', // Ultra clean, Apple-like soft background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  // Content Wrapper
  mainContentWrapper: {
    flex: 1,
    justifyContent: 'space-between', // Distributes space evenly
    paddingBottom: 20,
  },

  // Greeting
  greetingContainer: {
    marginBottom: 32,
  },
  greetingText: {
    fontSize: 15,
    color: '#888888',
    marginBottom: 4,
    fontWeight: '600',
  },
  userName: {
    fontSize: 32, // Larger greeting
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -1,
  },

  // Bento Grid
  bentoGrid: {
    flex: 1,
  },
  
  // Hero Widget
  bentoHero: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32, // Increased padding
    marginBottom: 20, // Increased margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 34, // Slightly larger
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 10,
  },
  // Sub Widgets Row
  bentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20, // Increased gap
  },
  bentoSquare: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 28, // Increased padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  widgetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  // Full Width Widget
  bentoFull: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 28, // Increased padding
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  bentoFullLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetIconContainerDark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2eb85c', // Premium green for rewards
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#2eb85c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bentoFullText: {
    flex: 1,
  },

  // Shared Widget Typography
  widgetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  widgetDesc: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
    fontWeight: '500',
  },
});



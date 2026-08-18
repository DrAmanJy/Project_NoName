import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, ScrollView, Modal, Pressable } from 'react-native';
import { useAuth } from '../../features/auth/auth-provider';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const insets = useSafeAreaInsets();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [menuVisible, setMenuVisible] = useState(false);

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

  const handleProfileClick = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = () => {
    setMenuVisible(false);
    signOut();
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 110 + insets.bottom }]}
      >
        
        {/* Top Navigation / Logo Bar */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logoImage} 
            />
            <Text style={styles.logoText}>SYNEX</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={menuVisible ? handleLogout : handleProfileClick} 
              style={[
                styles.avatarButton, 
                menuVisible && styles.logoutButtonActive
              ]}
              activeOpacity={0.8}
            >
              {menuVisible ? (
                <FontAwesome5 name="power-off" size={16} color="#ffffff" />
              ) : user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarSmall} />
              ) : (
                <FontAwesome5 name="user" size={16} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main Content Wrapper - Flex to fill screen */}
        <Pressable 
          style={styles.mainContentWrapper}
          onPress={() => {
            if (menuVisible) setMenuVisible(false);
          }}
        >
          
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
              <FontAwesome5 name="bolt" size={12} color={colors.primaryText} style={{ marginRight: 6 }} />
              <Text style={styles.heroBadgeText}>SYNEX</Text>
            </View>
            <Text style={styles.heroTitle}>Your Life Is Already Content. Get Paid For It.</Text>
            <Text style={styles.heroSubtitle}>Upload short lifestyle videos. No followers needed. No editing required. Just real moments, rewarded with real cash.</Text>
          </View>

          {/* Sub Widgets Row */}
          <View style={styles.bentoRow}>
            {/* Widget 1 */}
            <View style={styles.bentoSquare}>
              <View style={styles.widgetIconContainer}>
                <FontAwesome5 name="video" size={16} color={colors.primary} />
              </View>
              <Text style={styles.widgetTitle}>Easy Video Upload</Text>
              <Text style={styles.widgetDesc}>Upload your experiences in seconds. No technical skills needed.</Text>
            </View>

            {/* Widget 2 */}
            <View style={styles.bentoSquare}>
              <View style={styles.widgetIconContainer}>
                <FontAwesome5 name="check-circle" size={16} color={colors.primary} />
              </View>
              <Text style={styles.widgetTitle}>Quick Review Process</Text>
              <Text style={styles.widgetDesc}>Most videos are approved within 24 hours.</Text>
            </View>
          </View>

          {/* Full Width Bottom Widget */}
          <View style={styles.bentoFull}>
            <View style={styles.bentoFullLeft}>
              <View style={styles.widgetIconContainerDark}>
                <FontAwesome5 name="wallet" size={18} color="#ffffff" />
              </View>
              <View style={styles.bentoFullText}>
                <Text style={styles.widgetTitle}>Earn Rewards</Text>
                <Text style={styles.widgetDesc}>Every approved video earns real cash rewards. Simple and transparent.</Text>
              </View>
            </View>
          </View>

        </Animated.View>
        </Pressable>

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
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 10,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
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
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutButtonActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  // Content Wrapper
  mainContentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },

  // Greeting
  greetingContainer: {
    marginBottom: 32,
  },
  greetingText: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  userName: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
  },

  // Bento Grid
  bentoGrid: {
    flex: 1,
  },
  
  // Hero Widget
  bentoHero: {
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryText,
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 10,
  },
  // Sub Widgets Row
  bentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bentoSquare: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 28,
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
    backgroundColor: colors.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  // Full Width Widget
  bentoFull: {
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 28,
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
    backgroundColor: colors.success, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: colors.success,
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
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  widgetDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    fontWeight: '500',
  },
});



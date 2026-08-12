import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAuth } from '../../features/auth/auth-provider';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Primary Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconCircle}>
              <FontAwesome5 name="camera-retro" size={24} color="#7c3f1b" />
            </View>
            <Text style={styles.heroBadge}>READY TO RECORD</Text>
          </View>
          
          <Text style={styles.heroTitle}>Your life is already content. Get paid for it.</Text>
          <Text style={styles.heroSubtitle}>Upload short lifestyle videos. No followers needed. No editing required. Just real moments, rewarded with real cash.</Text>
          
          <TouchableOpacity 
            style={styles.heroButton} 
            activeOpacity={0.9} 
            onPress={() => router.push('/(tabs)/videos')}
          >
            <Text style={styles.heroButtonText}>Begin Recording</Text>
            <FontAwesome5 name="arrow-right" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Why Creators Trust Us */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitleCenter}>Why Creators Trust Us</Text>
          <Text style={styles.sectionSubtitleCenter}>We're changing how lifestyle videos are sourced. Fair pay, zero friction.</Text>

          <View style={styles.trustCard}>
            <View style={styles.trustIconCircle}>
              <FontAwesome5 name="users" size={20} color="#7c3f1b" />
            </View>
            <View style={styles.trustTextContent}>
              <Text style={styles.trustTitle}>No Followers Required</Text>
              <Text style={styles.trustDesc}>We buy content, not influence. You don't need a following to get paid.</Text>
            </View>
          </View>

          <View style={styles.trustCard}>
            <View style={styles.trustIconCircle}>
              <FontAwesome5 name="bolt" size={20} color="#7c3f1b" />
            </View>
            <View style={styles.trustTextContent}>
              <Text style={styles.trustTitle}>Fast, Transparent Payouts</Text>
              <Text style={styles.trustDesc}>If we select your video, you get paid directly. No hidden fees.</Text>
            </View>
          </View>

          <View style={styles.trustCard}>
            <View style={styles.trustIconCircle}>
              <FontAwesome5 name="shield-alt" size={20} color="#7c3f1b" />
            </View>
            <View style={styles.trustTextContent}>
              <Text style={styles.trustTitle}>Privacy Respected</Text>
              <Text style={styles.trustDesc}>Reviewed by real people. Your content stays yours until we purchase it.</Text>
            </View>
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.sectionContainerNoPadding}>
          <Text style={[styles.sectionTitleCenter, { paddingHorizontal: 20 }]}>Don't Just Take Our Word For It</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.testimonialScroll}
            snapToInterval={320 + 16} // card width + margin
            decelerationRate="fast"
          >
            {/* Testimonial 1 */}
            <View style={styles.testimonialCard}>
              <FontAwesome5 name="quote-right" size={60} color="#fcdcc5" style={styles.quoteBgIcon} />
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(i => <FontAwesome5 key={i} name="star" solid size={14} color="#f59e0b" style={{marginRight: 4}} />)}
              </View>
              <Text style={styles.testimonialQuote}>"I sent a 10-second clip of my morning coffee routine. Got paid same day. Incredible."</Text>
              <View style={styles.testimonialAuthorRow}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" }} style={styles.authorAvatarImage} />
                <View>
                  <Text style={styles.authorName}>Alex M.</Text>
                  <Text style={styles.authorTitle}>Creator</Text>
                </View>
              </View>
            </View>

            {/* Testimonial 2 */}
            <View style={styles.testimonialCard}>
              <FontAwesome5 name="quote-right" size={60} color="#fcdcc5" style={styles.quoteBgIcon} />
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(i => <FontAwesome5 key={i} name="star" solid size={14} color="#f59e0b" style={{marginRight: 4}} />)}
              </View>
              <Text style={styles.testimonialQuote}>"No editing, no pitching brands. I just live my life, film it, and get cash. Best side hustle."</Text>
              <View style={styles.testimonialAuthorRow}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" }} style={styles.authorAvatarImage} />
                <View>
                  <Text style={styles.authorName}>Sarah K.</Text>
                  <Text style={styles.authorTitle}>Creator</Text>
                </View>
              </View>
            </View>

            {/* Testimonial 3 */}
            <View style={styles.testimonialCard}>
              <FontAwesome5 name="quote-right" size={60} color="#fcdcc5" style={styles.quoteBgIcon} />
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(i => <FontAwesome5 key={i} name="star" solid size={14} color="#f59e0b" style={{marginRight: 4}} />)}
              </View>
              <Text style={styles.testimonialQuote}>"I had 200 followers when I started. It really doesn't matter. They just want authentic video."</Text>
              <View style={styles.testimonialAuthorRow}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" }} style={styles.authorAvatarImage} />
                <View>
                  <Text style={styles.authorName}>David T.</Text>
                  <Text style={styles.authorTitle}>Creator</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* How It Works Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitleCenter}>How It Works</Text>
          <View style={styles.infoCard}>
             <View style={styles.infoRow}>
               <View style={styles.infoIconWrapper}>
                 <FontAwesome5 name="video" size={16} color="#7c3f1b" />
               </View>
               <View style={styles.infoTextContainer}>
                 <Text style={styles.infoTitle}>1. Record Your Life</Text>
                 <Text style={styles.infoDesc}>Authentic, vertical, raw footage holding your visa.</Text>
               </View>
             </View>
             <View style={styles.infoRow}>
               <View style={styles.infoIconWrapper}>
                 <FontAwesome5 name="cloud-upload-alt" size={16} color="#7c3f1b" />
               </View>
               <View style={styles.infoTextContainer}>
                 <Text style={styles.infoTitle}>2. Upload Securely</Text>
                 <Text style={styles.infoDesc}>Send your raw video directly through this app.</Text>
               </View>
             </View>
             <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
               <View style={styles.infoIconWrapper}>
                 <FontAwesome5 name="money-bill-wave" size={16} color="#7c3f1b" />
               </View>
               <View style={styles.infoTextContainer}>
                 <Text style={styles.infoTitle}>3. Get Paid Cash</Text>
                 <Text style={styles.infoDesc}>If selected, you get paid transparently and instantly.</Text>
               </View>
             </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 130, // Clearance for custom tab bar
  },
  heroCard: {
    backgroundColor: '#fef1e6', // Warm peach
    borderRadius: 36,
    padding: 28,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fcdcc5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#934d28',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#3d1c00',
    letterSpacing: -1,
    lineHeight: 38,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#7c3f1b',
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 28,
  },
  heroButton: {
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 10,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 48,
  },
  sectionContainerNoPadding: {
    marginBottom: 48,
  },
  sectionTitleCenter: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitleCenter: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  trustCard: {
    flexDirection: 'row',
    backgroundColor: '#fffdf9',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f5efe6',
    alignItems: 'center',
  },
  trustIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fcdcc5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trustTextContent: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3d1c00',
    marginBottom: 4,
  },
  trustDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  testimonialScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  testimonialCard: {
    width: 320,
    backgroundColor: '#fffcf9',
    borderRadius: 24,
    padding: 28,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f5efe6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  quoteBgIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.5,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
    zIndex: 2,
  },
  testimonialQuote: {
    fontSize: 17,
    color: '#3d1c00',
    lineHeight: 26,
    fontWeight: '500',
    marginBottom: 28,
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
  testimonialAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  authorAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#f5efe6',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 2,
  },
  authorTitle: {
    fontSize: 13,
    color: '#888',
  },
  infoCard: {
    backgroundColor: '#fffcf9',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f5efe6',
  },
  infoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 20,
    marginBottom: 20,
  },
  infoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fcdcc5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3d1c00',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

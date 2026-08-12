import { Tabs, Redirect } from 'expo-router';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/auth-provider';
import { LoadingScreen } from '../../components/LoadingScreen';
import { CustomTabBar } from '../../components/CustomTabBar';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function TabsLayout() {
  const { status, user, signOut } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status !== 'authenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...(props as unknown as BottomTabBarProps)} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f5efe6',
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => signOut()} 
            style={{ 
              marginRight: 20, 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              backgroundColor: '#fffdf9', 
              justifyContent: 'center', 
              alignItems: 'center', 
              borderWidth: 1, 
              borderColor: '#f5efe6' 
            }} 
            activeOpacity={0.8}
          >
            <FontAwesome5 name="sign-out-alt" size={14} color="#7c3f1b" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitleAlign: 'left',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {user?.avatarUrl ? (
                <Image 
                  source={{ uri: user.avatarUrl }} 
                  style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#f5efe6' }} 
                />
              ) : null}
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#111', letterSpacing: -0.5 }}>
                {user?.name?.split(' ')[0] || 'User'}
              </Text>
            </View>
          ),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Videos',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎬</Text>,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💰</Text>,
        }}
      />
    </Tabs>
  );
}

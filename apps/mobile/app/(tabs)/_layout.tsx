import { Tabs, Redirect } from 'expo-router';
import { View, Text, Image } from 'react-native';

import { useAuth } from '../../features/auth/auth-provider';
import { LoadingScreen } from '../../components/LoadingScreen';
import { CustomTabBar } from '../../components/CustomTabBar';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function TabsLayout() {
  const { status, user } = useAuth();

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
        headerShown: false,
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
                  style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#eaeaea' }} 
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
        name="submissions"
        options={{
          title: 'Submissions',
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
    </Tabs>
  );
}

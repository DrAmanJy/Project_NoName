import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor?.options || {};
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName = 'home';
          let displayLabel = 'Home';
          
          if (route.name === 'index') {
            iconName = 'home';
            displayLabel = 'Home';
          } else if (route.name === 'videos') {
            iconName = 'plus';
            displayLabel = '';
          } else if (route.name === 'earnings') {
            iconName = 'ellipsis-h';
            displayLabel = 'Status';
          }

          const isCenter = route.name === 'videos';

          return (
            <TabBarButton
              key={route.key}
              isFocused={isFocused}
              isCenter={isCenter}
              iconName={iconName}
              label={displayLabel}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

type TabBarButtonProps = {
  isFocused: boolean;
  isCenter: boolean;
  iconName: string;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
};

function TabBarButton({ isFocused, isCenter, iconName, label, onPress, onLongPress }: TabBarButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.1 : 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.1 : 1,
      useNativeDriver: true,
    }).start();
  };

  const color = isFocused ? '#934d28' : '#9c9c9c';

  if (isCenter) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.centerButtonContainer}
      >
        <Animated.View style={[styles.centerButton, { transform: [{ scale }] }]}>
          <FontAwesome5 name={iconName} size={22} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
        <FontAwesome5 name={iconName} size={20} color={color} />
        <Text style={[styles.tabLabel, { color }]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fffdf9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 15,
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    paddingTop: 15,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  centerButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: '#934d28', // Brown matching screenshot
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -45, // Moved up
    shadowColor: '#934d28',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});

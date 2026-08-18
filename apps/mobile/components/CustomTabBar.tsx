import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';

export function CustomTabBar({ state, descriptors: _descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  return (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBar, { paddingBottom: 15 }]}>
        {state.routes.map((route, index) => {
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
          } else if (route.name === 'submissions') {
            iconName = 'list-alt';
            displayLabel = 'My Submissions';
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
              colors={colors}
              styles={styles}
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
  colors: any;
  styles: any;
};

function TabBarButton({ isFocused, isCenter, iconName, label, onPress, onLongPress, colors, styles }: TabBarButtonProps) {
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

  const color = isFocused ? colors.primary : colors.textMuted;

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
          <FontAwesome5 name={iconName} size={20} color={colors.primaryText} />
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

const getStyles = (colors: any) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: colors.card,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary, 
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -28, 
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';

export type DialogType = 'error' | 'success' | 'info';

interface CustomDialogProps {
  visible: boolean;
  type?: DialogType;
  title?: string;
  message: string;
  onClose: () => void;
}

export function CustomDialog({ visible, type = 'error', title, message, onClose }: CustomDialogProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle';
  let iconColor = colors.danger;
  let iconBgColor = colors.danger + '26'; // 15% opacity
  let defaultTitle = 'Error';

  if (type === 'success') {
    iconName = 'checkmark-circle';
    iconColor = colors.success;
    iconBgColor = colors.success + '26';
    defaultTitle = 'Success';
  } else if (type === 'info') {
    iconName = 'information-circle';
    iconColor = '#007AFF'; // keeping brand blue for info if no specific info color
    iconBgColor = '#007AFF26';
    defaultTitle = 'Info';
  }

  const displayTitle = title || defaultTitle;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.dialogContainer, { opacity: fadeAnim }]}>
          <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
            <Ionicons name={iconName} size={48} color={iconColor} />
          </View>
          
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Dismiss</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

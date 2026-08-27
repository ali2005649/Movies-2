import React from 'react';
import {
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import WebViewVideoPlayer from '@/components/WebViewVideoPlayer';
import { COLORS } from '@/constants/theme';

type WebViewVideoModalProps = {
  visible: boolean;
  videoUrl: string;
  title?: string;
  onClose: () => void;
};

/**
 * Full-screen cinematic modal wrapping WebViewVideoPlayer.
 */
export default function WebViewVideoModal({
  visible,
  videoUrl,
  title,
  onClose,
}: WebViewVideoModalProps) {
  const insets = useSafeAreaInsets();

  const handleClose = async () => {
    await Haptics.selectionAsync();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
      <View style={styles.backdrop}>
        <View
          style={[
            styles.content,
            {
              paddingTop: Math.max(insets.top, 16) + 4,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title || 'Video'}
            </Text>
            <Pressable
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close video"
            >
              <Ionicons name="close" size={22} color={COLORS.textWhite} />
            </Pressable>
          </View>

          <View style={styles.player}>
            {visible && videoUrl ? (
              <WebViewVideoPlayer videoUrl={videoUrl} title={title} />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  title: {
    flex: 1,
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  player: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

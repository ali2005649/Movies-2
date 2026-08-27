import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  type LayoutChangeEvent,
} from 'react-native';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import * as Brightness from 'expo-brightness';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/theme';
import { DEMO_MEDIA } from '@/constants/config';
import { cueAt, parseVtt, type Cue } from '@/utils/vtt';

type AdvancedVideoPlayerProps = {
  uri?: string;
  /** Inline WebVTT string (preferred for Expo Go demos). */
  subtitleVtt?: string;
  title?: string;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * Advanced trailer player:
 * - CC subtitle toggle (WebVTT)
 * - Left vertical pan → screen brightness
 * - Right vertical pan → playback volume
 */
export default function AdvancedVideoPlayer({
  uri = DEMO_MEDIA.trailerUrl,
  subtitleVtt = DEMO_MEDIA.subtitlesVtt,
  title,
}: AdvancedVideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [positionMs, setPositionMs] = useState(0);
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [hud, setHud] = useState<{ kind: 'brightness' | 'volume'; value: number } | null>(
    null
  );
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(220);

  const brightnessRef = useRef(0.6);
  const volumeRef = useRef(1);
  const gestureStart = useRef({ brightness: 0.6, volume: 1, side: 'left' as 'left' | 'right' });

  const cues: Cue[] = useMemo(() => parseVtt(subtitleVtt), [subtitleVtt]);
  const activeCue = subtitlesOn ? cueAt(cues, positionMs) : null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          const current = await Brightness.getBrightnessAsync();
          if (mounted) brightnessRef.current = current;
        }
      } catch {
        // Brightness unavailable on some platforms
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setReady(true);
    setPlaying(status.isPlaying);
    setPositionMs(status.positionMillis ?? 0);
  }, []);

  const togglePlay = async () => {
    const status = await videoRef.current?.getStatusAsync();
    if (!status?.isLoaded) return;
    if (status.isPlaying) await videoRef.current?.pauseAsync();
    else await videoRef.current?.playAsync();
  };

  const toggleSubtitles = async () => {
    await Haptics.selectionAsync();
    setSubtitlesOn((v) => !v);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
    setHeight(Math.max(200, w * 0.56));
  };

  const gesture = useMemo(() => {
    return Gesture.Pan()
      .runOnJS(true)
      .activeOffsetY([-8, 8])
      .failOffsetX([-20, 20])
      .onBegin((e) => {
        const side = width > 0 && e.x >= width / 2 ? 'right' : 'left';
        gestureStart.current = {
          brightness: brightnessRef.current,
          volume: volumeRef.current,
          side,
        };
      })
      .onUpdate((e) => {
        // Finger up → increase (negative translationY)
        const change = -e.translationY / Math.max(height, 1);

        if (gestureStart.current.side === 'left') {
          const next = clamp01(gestureStart.current.brightness + change);
          brightnessRef.current = next;
          void Brightness.setBrightnessAsync(next).catch(() => undefined);
          setHud({ kind: 'brightness', value: next });
        } else {
          const next = clamp01(gestureStart.current.volume + change);
          volumeRef.current = next;
          void videoRef.current?.setStatusAsync({ volume: next });
          setHud({ kind: 'volume', value: next });
        }
      })
      .onFinalize(() => {
        setTimeout(() => setHud(null), 500);
      });
  }, [width, height]);

  return (
    <View style={[styles.wrap, { height: height + 28 }]} onLayout={onLayout}>
      <GestureDetector gesture={gesture}>
        <View style={[styles.surface, { height }]}>
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            onPlaybackStatusUpdate={onStatus}
          />

          {!ready && (
            <View style={styles.loading}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          )}

          {activeCue ? (
            <View style={styles.subtitleBox} pointerEvents="none">
              <Text style={styles.subtitleText}>{activeCue}</Text>
            </View>
          ) : null}

          {hud ? (
            <View style={styles.hud} pointerEvents="none">
              <Ionicons
                name={hud.kind === 'brightness' ? 'sunny' : 'volume-high'}
                size={22}
                color={COLORS.primary}
              />
              <View style={styles.hudTrack}>
                <View
                  style={[styles.hudFill, { width: `${Math.round(hud.value * 100)}%` }]}
                />
              </View>
              <Text style={styles.hudLabel}>
                {hud.kind === 'brightness' ? 'Brightness' : 'Volume'}{' '}
                {Math.round(hud.value * 100)}%
              </Text>
            </View>
          ) : null}

          <View style={styles.controls}>
            <Pressable onPress={togglePlay} style={styles.controlBtn} hitSlop={8}>
              <Ionicons
                name={playing ? 'pause' : 'play'}
                size={20}
                color={COLORS.textWhite}
              />
            </Pressable>

            <Text style={styles.controlTitle} numberOfLines={1}>
              {title ?? 'Trailer'}
            </Text>

            <Pressable
              onPress={toggleSubtitles}
              style={[styles.controlBtn, subtitlesOn && styles.ccOn]}
              hitSlop={8}
            >
              <Text style={[styles.ccText, subtitlesOn && styles.ccTextOn]}>CC</Text>
            </Pressable>
          </View>
        </View>
      </GestureDetector>

      <Text style={styles.hint}>
        Left swipe ↑↓ brightness · Right swipe ↑↓ volume
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: 8,
  },
  surface: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  subtitleBox: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 54,
    alignItems: 'center',
  },
  subtitleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
    lineHeight: 20,
  },
  hud: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(11,15,25,0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 6,
    minWidth: 140,
  },
  hudTrack: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  hudFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  hudLabel: {
    color: COLORS.textWhite,
    fontSize: 11,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  controlBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  controlTitle: {
    flex: 1,
    color: COLORS.textWhite,
    fontSize: 13,
    fontWeight: '600',
  },
  ccOn: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ccText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  ccTextOn: {
    color: COLORS.primary,
  },
  hint: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});

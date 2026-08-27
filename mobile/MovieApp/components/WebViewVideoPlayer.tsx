import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '@/constants/theme';

const POPUP_GUARD = `
window.open = function() { return null; };
window.alert = function() { return null; };
true;
`;

type WebViewVideoPlayerProps = {
  videoUrl: string;
  title?: string;
};

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isAllowedNavigation(requestUrl: string, allowedHost: string): boolean {
  const trimmed = requestUrl.trim();
  if (
    trimmed.startsWith('about:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return true;
  }

  const host = hostnameOf(trimmed);
  if (!host) return false;
  return host === allowedHost;
}

/**
 * Generic in-app video WebView.
 * Stays on the host of `videoUrl` and blocks popups / third-party redirects.
 */
export default function WebViewVideoPlayer({
  videoUrl,
  title,
}: WebViewVideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const allowedHost = useMemo(() => hostnameOf(videoUrl), [videoUrl]);

  const onShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) => {
      if (!allowedHost) return false;
      return isAllowedNavigation(request.url, allowedHost);
    },
    [allowedHost]
  );

  if (!allowedHost) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>This video URL is not valid.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap} accessibilityLabel={title ?? 'Video player'}>
      <WebView
        source={{ uri: videoUrl }}
        style={styles.webview}
        javaScriptEnabled
        javaScriptCanOpenWindowsAutomatically={false}
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        originWhitelist={['https://*', 'http://*']}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        injectedJavaScriptBeforeContentLoaded={POPUP_GUARD}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        )}
      />
      {loading ? (
        <View pointerEvents="none" style={styles.loader}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9, 9, 11, 0.45)',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.cardSolid,
    borderRadius: 12,
  },
  fallbackText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});

import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

/**
 * Root navigator.
 * Details uses a fade screen animation so Reanimated's shared-element poster
 * (sharedTransitionTag) is the continuous visual bridge Home → Details.
 */
export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="details"
            options={{
              animation: 'fade',
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="signup"
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

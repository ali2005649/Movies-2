import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { getGridMetrics, type GridMetrics } from '@/utils/responsive';

/**
 * Live layout metrics that update on rotation and window resize (tablets / foldables).
 */
export function useResponsiveLayout(): GridMetrics {
  const { width, height } = useWindowDimensions();

  return useMemo(() => getGridMetrics(width, height), [width, height]);
}

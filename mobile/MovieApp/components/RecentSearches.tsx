import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GlassView from '@/components/GlassView';
import { COLORS, RADIUS } from '@/constants/theme';

type RecentSearchesProps = {
  items: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClearAll: () => void;
};

/** Glass recent-search list shown when the search field is empty. */
export default function RecentSearches({
  items,
  onSelect,
  onRemove,
  onClearAll,
}: RecentSearchesProps) {
  if (!items.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time-outline" size={16} color={COLORS.primary} />
          <Text style={styles.kicker}>Recent Searches</Text>
        </View>
        <Pressable
          onPress={async () => {
            await Haptics.selectionAsync();
            onClearAll();
          }}
          hitSlop={8}
          accessibilityLabel="Clear all recent searches"
        >
          <Text style={styles.clearAll}>Clear All</Text>
        </Pressable>
      </View>

      <GlassView style={styles.list}>
        {items.map((item, index) => (
          <View
            key={`${item}-${index}`}
            style={[
              styles.row,
              index !== items.length - 1 && styles.rowDivider,
            ]}
          >
            <Pressable
              style={styles.rowMain}
              onPress={async () => {
                await Haptics.selectionAsync();
                onSelect(item);
              }}
              accessibilityLabel={`Search for ${item}`}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="search-outline" size={14} color={COLORS.primary} />
              </View>
              <Text style={styles.query} numberOfLines={1}>
                {item}
              </Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                onRemove(item);
              }}
              hitSlop={10}
              style={styles.removeBtn}
              accessibilityLabel={`Remove ${item} from recent searches`}
            >
              <Ionicons name="close" size={16} color={COLORS.textMuted} />
            </Pressable>
          </View>
        ))}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kicker: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  clearAll: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    minHeight: 52,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    minWidth: 0,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  query: {
    flex: 1,
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
  removeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

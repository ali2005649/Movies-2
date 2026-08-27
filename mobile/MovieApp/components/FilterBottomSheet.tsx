import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/theme';

type FilterBottomSheetProps = {
  title: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
};

/**
 * Portal-based filter sheet (BottomSheetModal).
 * Unlike BottomSheet (index=-1), modals do not sit in the layout tree when
 * dismissed — so they cannot freeze / intercept Home FlatList scrolling on Android.
 */
const FilterBottomSheet = forwardRef<BottomSheetModal, FilterBottomSheetProps>(
  function FilterBottomSheet({ title, options, selected, onSelect }, ref) {
    const snapPoints = useMemo(() => ['42%', '62%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.65}
          pressBehavior="close"
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheet}
        handleIndicatorStyle={styles.handle}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <BottomSheetScrollView contentContainerStyle={styles.list}>
          {options.map((option) => {
            const active = option === selected;
            return (
              <Pressable
                key={option}
                style={[styles.option, active && styles.optionActive]}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  onSelect(option);
                }}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {option}
                </Text>
                {active ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default FilterBottomSheet;

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: COLORS.cardSolid,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  handle: {
    backgroundColor: COLORS.border,
    width: 42,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '800',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.goldSoft,
  },
  optionText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
  optionTextActive: {
    color: COLORS.primary,
  },
  check: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});

import { Children, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';

import { rowEnter, rowLayout } from '@/constants/motion';
import { Spacing } from '@/constants/theme';

const GAP = Spacing.two;

/** How many columns of at least `minWidth` fit into `width`; one until the width is known. */
function columnCount(width: number, minWidth: number) {
  return Math.max(1, Math.floor((width + GAP) / (minWidth + GAP)));
}

/** Tracks the width a view is laid out at. */
function useWidth() {
  const [width, setWidth] = useState(0);
  return [width, (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)] as const;
}

/**
 * Lays children out in equal columns when there is room (tablets, landscape) and as a plain list
 * on phones. Rows line up, so it suits items of similar height, like recipe cards.
 */
export function Grid({ children, minItemWidth = 320 }: { children: ReactNode; minItemWidth?: number }) {
  const [width, onLayout] = useWidth();
  const columns = columnCount(width, minItemWidth);
  const items = Children.toArray(children);
  if (columns === 1) {
    return (
      <View style={styles.list} onLayout={onLayout}>
        {items}
      </View>
    );
  }
  const itemWidth = (width - GAP * (columns - 1)) / columns;
  return (
    <View style={styles.grid} onLayout={onLayout}>
      {items.map((item, i) => (
        <View key={i} style={{ width: itemWidth }}>
          {item}
        </View>
      ))}
    </View>
  );
}

/**
 * Splits blocks of different heights (e.g. shopping list departments) into side-by-side columns
 * of about equal length; `weight` estimates each block's height. One column on phones.
 * Blocks fade in and slide into place; the animation sits on each block's own wrapper, since a block
 * that animated itself would keep the offset of a wrapper that moved under it. A block that goes away
 * does so at once (its rows fade out on their own): fading the block out too left its space empty.
 */
export function Columns({ blocks, minColumnWidth = 340 }: { blocks: { key: string; weight: number; node: ReactNode }[]; minColumnWidth?: number }) {
  const [width, onLayout] = useWidth();
  const count = columnCount(width, minColumnWidth);
  const columns: { weight: number; nodes: ReactNode[] }[] = Array.from({ length: count }, () => ({ weight: 0, nodes: [] }));
  // keep the original order: fill a column until it reaches its share, then move on
  const share = blocks.reduce((sum, b) => sum + b.weight, 0) / count;
  let current = 0;
  for (const block of blocks) {
    if (current < count - 1 && columns[current].weight > 0 && columns[current].weight + block.weight / 2 > share) current++;
    columns[current].weight += block.weight;
    columns[current].nodes.push(
      <Animated.View key={block.key} entering={rowEnter} layout={rowLayout}>
        {block.node}
      </Animated.View>,
    );
  }
  return (
    <View style={styles.row} onLayout={onLayout}>
      {columns.map((column, i) => (
        <View key={i} style={styles.column}>
          {column.nodes}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: GAP },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  column: { flex: 1, gap: Spacing.three },
});

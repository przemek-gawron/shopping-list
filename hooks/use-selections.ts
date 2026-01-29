import { useMemo } from 'react';
import { useAppContext } from '@/context/app-context';

export function useSelections() {
  const { selections, setSelection, clearSelections, getSelectionCount } = useAppContext();

  const totalSelections = useMemo(
    () => selections.reduce((sum, s) => sum + s.count, 0),
    [selections]
  );

  const hasSelections = totalSelections > 0;

  return {
    selections,
    totalSelections,
    hasSelections,
    setSelection,
    clearSelections,
    getSelectionCount,
  };
}

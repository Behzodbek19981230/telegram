import { useCallback, useState } from 'react';

export function useMessageSelection() {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggle = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const select = useCallback((id) => {
    setSelectedIds((prev) => new Set(prev).add(id));
  }, []);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  return { selectedIds, toggle, select, clear, isSelecting: selectedIds.size > 0 };
}

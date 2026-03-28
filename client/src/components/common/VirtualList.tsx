import type { CSSProperties, ReactNode } from 'react';
import { useMemo, useState } from 'react';

type VirtualListProps<T> = {
  items: T[];
  itemHeight: number;
  height: number;
  overscan?: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function VirtualList<T>({
  items,
  itemHeight,
  height,
  overscan = 6,
  renderItem,
  className,
  style,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const { startIndex, endIndex, offsetY, visibleItems, totalHeight } = useMemo(() => {
    const fullHeight = items.length * itemHeight;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(height / itemHeight) + overscan * 2;
    const end = Math.min(items.length - 1, start + visibleCount);
    const subset = items.slice(start, end + 1);
    return {
      startIndex: start,
      endIndex: end,
      offsetY: start * itemHeight,
      visibleItems: subset,
      totalHeight: fullHeight,
    };
  }, [height, itemHeight, items, overscan, scrollTop]);

  return (
    <div
      className={className}
      style={{
        height,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        ...style,
      }}
      onScroll={(event) => {
        setScrollTop(event.currentTarget.scrollTop);
      }}
      role="listbox"
      aria-rowcount={items.length}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const absoluteIndex = startIndex + index;
            if (absoluteIndex < startIndex || absoluteIndex > endIndex) return null;
            return (
              <div key={`vl-${absoluteIndex}`} style={{ height: itemHeight }}>
                {renderItem(item, absoluteIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import type { MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type PanelWidths = {
  left: number;
  right: number;
};

type UseResizablePanelsResult = {
  leftWidth: number;
  rightWidth: number;
  setLeftWidth: (value: number) => void;
  setRightWidth: (value: number) => void;
  onLeftDragStart: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onRightDragStart: (event: ReactMouseEvent<HTMLButtonElement>) => void;
};

const STORAGE_KEY = 'giq:draftboard:panel-widths:v1';
const DEFAULT_WIDTHS: PanelWidths = { left: 320, right: 320 };
const MIN_LEFT = 260;
const MAX_LEFT = 460;
const MIN_RIGHT = 280;
const MAX_RIGHT = 460;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function readInitial(): PanelWidths {
  if (typeof window === 'undefined') return DEFAULT_WIDTHS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WIDTHS;
    const parsed = JSON.parse(raw) as Partial<PanelWidths>;
    const left = clamp(Number(parsed.left ?? DEFAULT_WIDTHS.left), MIN_LEFT, MAX_LEFT);
    const right = clamp(Number(parsed.right ?? DEFAULT_WIDTHS.right), MIN_RIGHT, MAX_RIGHT);
    return { left, right };
  } catch {
    return DEFAULT_WIDTHS;
  }
}

export function useResizablePanels(): UseResizablePanelsResult {
  const [widths, setWidths] = useState<PanelWidths>(() => readInitial());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  }, [widths]);

  const setLeftWidth = useCallback((value: number) => {
    setWidths((previous) => ({ ...previous, left: clamp(value, MIN_LEFT, MAX_LEFT) }));
  }, []);

  const setRightWidth = useCallback((value: number) => {
    setWidths((previous) => ({ ...previous, right: clamp(value, MIN_RIGHT, MAX_RIGHT) }));
  }, []);

  const onLeftDragStart = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = widths.left;

      const onMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        setLeftWidth(startWidth + delta);
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [widths.left, setLeftWidth],
  );

  const onRightDragStart = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = widths.right;

      const onMove = (moveEvent: MouseEvent) => {
        const delta = startX - moveEvent.clientX;
        setRightWidth(startWidth + delta);
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [widths.right, setRightWidth],
  );

  return useMemo(
    () => ({
      leftWidth: widths.left,
      rightWidth: widths.right,
      setLeftWidth,
      setRightWidth,
      onLeftDragStart,
      onRightDragStart,
    }),
    [widths, setLeftWidth, setRightWidth, onLeftDragStart, onRightDragStart],
  );
}

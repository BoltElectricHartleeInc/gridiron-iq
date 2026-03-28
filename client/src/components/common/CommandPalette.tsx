import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { T } from '../../styles/tokens';

export type CommandAction = {
  id: string;
  title: string;
  group?: string;
  shortcut?: string;
  description?: string;
  keywords?: string[];
  run: () => void;
};

type CommandPaletteProps = {
  actions: CommandAction[];
  style?: CSSProperties;
};

function normalized(value: string): string {
  return value.trim().toLowerCase();
}

function matches(action: CommandAction, query: string): boolean {
  if (!query) return true;
  const q = normalized(query);
  const haystack = [
    action.title,
    action.group ?? '',
    action.description ?? '',
    ...(action.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export default function CommandPalette({ actions, style }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => actions.filter((action) => matches(action, query)), [actions, query]);

  useEffect(() => {
    const nativeHandler = (event: globalThis.KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (!isShortcut) return;
      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener('keydown', nativeHandler);
    return () => {
      window.removeEventListener('keydown', nativeHandler);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    setTimeout(() => {
      const input = document.getElementById('giq-command-input');
      input?.focus();
    }, 0);
  }, [open]);

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered.length, activeIndex]);

  if (!open) return null;

  const runAction = (index: number) => {
    const action = filtered[index];
    if (!action) return;
    action.run();
    setOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(3, 7, 13, 0.62)',
        display: 'grid',
        placeItems: 'start center',
        paddingTop: 72,
        ...style,
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          width: 'min(760px, calc(100vw - 32px))',
          background: T.surface,
          border: `1px solid ${T.borderHi}`,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: 10, borderBottom: `1px solid ${T.border}` }}>
          <input
            id="giq-command-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((idx) => Math.min(idx + 1, Math.max(0, filtered.length - 1)));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((idx) => Math.max(0, idx - 1));
              } else if (event.key === 'Enter') {
                event.preventDefault();
                runAction(activeIndex);
              } else if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
              }
            }}
            placeholder="Search commands…"
            style={{
              width: '100%',
              border: `1px solid ${T.border}`,
              background: T.panel,
              color: T.txt,
              borderRadius: 9,
              fontSize: 13,
              padding: '9px 10px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ maxHeight: 420, overflowY: 'auto', padding: 6 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 16, color: T.txtSub, fontSize: 12 }}>No commands found.</div>
          ) : (
            filtered.map((action, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => runAction(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  style={{
                    width: '100%',
                    border: `1px solid ${active ? T.borderFoc : 'transparent'}`,
                    background: active ? T.blueSub : 'transparent',
                    color: T.txt,
                    textAlign: 'left',
                    borderRadius: 8,
                    padding: '8px 10px',
                    marginBottom: 4,
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr) auto',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{action.title}</span>
                      {action.group && (
                        <span
                          style={{
                            fontSize: 8,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: T.txtMuted,
                            fontWeight: 700,
                          }}
                        >
                          {action.group}
                        </span>
                      )}
                    </div>
                    {action.description && (
                      <div style={{ marginTop: 2, fontSize: 10, color: T.txtSub }}>{action.description}</div>
                    )}
                  </div>
                  {action.shortcut && (
                    <span
                      style={{
                        fontSize: 9,
                        color: T.txtMuted,
                        border: `1px solid ${T.border}`,
                        borderRadius: 6,
                        padding: '2px 5px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {action.shortcut}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

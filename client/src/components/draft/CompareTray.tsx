import { POS, T, gradeLetter } from '../../styles/tokens';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export type CompareProspect = {
  id: string;
  fullName: string;
  school: string;
  position: string;
  grade: number;
};

type CompareTrayProps = {
  prospects: CompareProspect[];
  onRemove: (id: string) => void;
  onCompare: () => void;
  onClear: () => void;
};

const MAX_COMPARE = 4;

export function CompareTray({ prospects, onRemove, onCompare, onClear }: CompareTrayProps) {
  if (!prospects.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 20,
        right: 20,
        bottom: 16,
        zIndex: 70,
        border: `1px solid ${T.borderHi}`,
        background: T.surface,
        borderRadius: 12,
        padding: 10,
        boxShadow: '0 12px 30px rgba(0,0,0,0.28)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, color: T.txtMuted, letterSpacing: '0.12em', fontWeight: 800, textTransform: 'uppercase' }}>
            Compare Tray
          </div>
          <Badge tone="neutral">{prospects.length}/{MAX_COMPARE}</Badge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Button size="sm" variant="ghost" onClick={onClear}>
            Clear
          </Button>
          <Button size="sm" variant="primary" onClick={onCompare}>
            Compare →
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
        {prospects.map((prospect) => {
          const palette = POS[prospect.position] ?? { bg: T.blueSub, border: T.borderFoc, text: T.blueBright, pill: T.panel };
          return (
            <div
              key={prospect.id}
              style={{
                border: `1px solid ${T.border}`,
                background: T.panel,
                borderRadius: 10,
                padding: 8,
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.txt,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {prospect.fullName}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 9, color: T.txtSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prospect.school}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(prospect.id)}
                  style={{
                    border: `1px solid ${T.border}`,
                    background: T.elevated,
                    color: T.txtSub,
                    borderRadius: 6,
                    fontSize: 9,
                    fontWeight: 800,
                    width: 18,
                    height: 18,
                    lineHeight: '16px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  aria-label={`Remove ${prospect.fullName} from compare`}
                >
                  ×
                </button>
              </div>
              <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    border: `1px solid ${palette.border}`,
                    background: palette.bg,
                    color: palette.text,
                    borderRadius: 999,
                    padding: '3px 6px',
                  }}
                >
                  {prospect.position}
                </span>
                <span style={{ color: T.txt, fontSize: 11, fontWeight: 800 }}>{gradeLetter(prospect.grade)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

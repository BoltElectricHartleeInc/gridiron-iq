import type { CSSProperties, ReactElement } from 'react';
import Card from '../ui/Card';
import { T } from '../../styles/tokens';

type AdvisorIntel = {
  pick: string;
  fit: string;
  intel: string;
  concern?: string;
  confidence?: number;
  rationale?: string[];
};

type AdvisorIntelCardProps = {
  loading?: boolean;
  intel?: AdvisorIntel | null;
  style?: CSSProperties;
};

function skeletonLine(width: string): ReactElement {
  return (
    <div
      style={{
        width,
        height: 9,
        borderRadius: 999,
        background: `linear-gradient(90deg, ${T.panel} 0px, ${T.elevated} 40px, ${T.panel} 80px)`,
        backgroundSize: '200px 9px',
        animation: 'advisor-shimmer 1.2s linear infinite',
      }}
    />
  );
}

export function AdvisorIntelCard({ loading = false, intel = null, style }: AdvisorIntelCardProps) {
  return (
    <Card style={style}>
      <style>
        {`
          @keyframes advisor-shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
        `}
      </style>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {skeletonLine('58%')}
          {skeletonLine('92%')}
          {skeletonLine('84%')}
          {skeletonLine('67%')}
        </div>
      ) : intel ? (
        <div
          style={{
            borderRadius: 9,
            border: `1px solid ${T.gold}`,
            background: T.goldSub,
            padding: 9,
            color: T.txt,
          }}
        >
          <div style={{ fontSize: 9, color: T.goldBright, fontWeight: 900, letterSpacing: '0.08em' }}>⚡ WAR ROOM INTEL</div>
          <div style={{ marginTop: 7, fontSize: 11 }}>
            <strong>PICK:</strong> {intel.pick}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: T.txtSub }}>
            <strong>FIT:</strong> {intel.fit}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: T.txtSub }}>
            <strong>INTEL:</strong> {intel.intel}
          </div>
          {typeof intel.confidence === 'number' && (
            <div style={{ marginTop: 5, fontSize: 10, color: T.goldBright, fontWeight: 700 }}>CONFIDENCE: {intel.confidence}%</div>
          )}
          {intel.rationale && intel.rationale.length > 0 && (
            <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 16, color: T.txtSub, fontSize: 10 }}>
              {intel.rationale.slice(0, 3).map((line, idx) => (
                <li key={`advisor-rationale-${idx}`}>{line}</li>
              ))}
            </ul>
          )}
          {intel.concern && (
            <div style={{ marginTop: 5, fontSize: 11, color: T.amber }}>
              <strong>CONCERN:</strong> {intel.concern}
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: T.txtSub, fontSize: 11 }}>Advisor standing by for next actionable window.</div>
      )}
    </Card>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../api';
import DashboardLayout from '../components/DashboardLayout';

const TYPES = ['All', 'Forex', 'Gold', 'Crypto', 'Indices'];
const STATUSES = ['All', 'active', 'closed', 'cancelled'];

const DIRECTION_STYLE: Record<string, React.CSSProperties> = {
  BUY:  { background: 'rgba(76,175,80,0.15)', color: '#0ecb81', border: '1px solid rgba(76,175,80,0.4)' },
  SELL: { background: 'rgba(239,83,80,0.15)', color: '#f6465d', border: '1px solid rgba(239,83,80,0.4)' },
};

const RESULT_BADGE: Record<string, string> = {
  win:        '#0ecb81',
  loss:       '#f6465d',
  breakeven:  '#9a9a9a',
};

export default function Signals() {
  const [signals, setSignals] = useState<any[]>([]);
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type !== 'All') params.set('type', type);
    if (status !== 'All') params.set('status', status);
    api.getSignals(params.toString())
      .then(s => setSignals(s))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type, status]);

  return (
    <DashboardLayout title="Trading Signals" subtitle="Daily Forex, Gold, Crypto and Indices signals from our expert analysts.">
        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`btn btn-sm ${type === t ? 'btn-gold' : 'btn-outline'}`}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}>{s === 'All' ? 'All Status' : s}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><span className="spinner"></span></div>
        ) : signals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>📡</p>
            <h3>No signals yet</h3>
            <p style={{ color: '#9a9a9a', marginTop: 8 }}>Check back soon — our analysts post signals daily.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {signals.map(s => (
              <div key={s.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Top stripe */}
                <div style={{ height: 3, background: s.direction === 'BUY' ? '#0ecb81' : '#f6465d', margin: '-24px -24px 20px' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 800 }}>{s.pair}</span>
                    <span style={{ marginLeft: 8, fontSize: '0.72rem', color: '#9a9a9a', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 20 }}>{s.type}</span>
                  </div>
                  <span style={{ ...DIRECTION_STYLE[s.direction] || {}, padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.85rem' }}>
                    {s.direction}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  {[
                    ['Entry', s.entry],
                    ['Stop Loss', s.stopLoss],
                    ['TP 1', s.tp1],
                    ...(s.tp2 ? [['TP 2', s.tp2]] : []),
                    ...(s.tp3 ? [['TP 3', s.tp3]] : []),
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#9a9a9a', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {s.notes && (
                  <p style={{ fontSize: '0.8rem', color: '#9a9a9a', marginBottom: 14, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>{s.notes}</p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', color: '#666' }}>
                    {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {s.status === 'active' && (
                      <span style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>● ACTIVE</span>
                    )}
                    {s.status === 'cancelled' && (
                      <span style={{ background: 'rgba(154,154,154,0.15)', color: '#9a9a9a', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem' }}>CANCELLED</span>
                    )}
                    {s.status === 'closed' && s.result && (
                      <>
                        <span style={{ background: `rgba(${s.result === 'win' ? '76,175,80' : s.result === 'loss' ? '239,83,80' : '154,154,154'},0.15)`, color: RESULT_BADGE[s.result] || '#9a9a9a', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{s.result}</span>
                        {s.pips != null && (
                          <span style={{ color: s.result === 'win' ? '#0ecb81' : '#f6465d', fontWeight: 700, fontSize: '0.82rem' }}>
                            {s.result === 'win' ? '+' : '-'}{Math.abs(s.pips)} pips
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </DashboardLayout>
  );
}

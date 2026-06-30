import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const GLOSSARY = [
  ['Pip', 'The smallest price movement in a currency pair. For most pairs, 1 pip = 0.0001.'],
  ['Lot', 'A standard unit of currency. 1 standard lot = 100,000 units. 1 mini lot = 10,000.'],
  ['Spread', 'The difference between the bid (sell) and ask (buy) price.'],
  ['Leverage', 'Borrowing capital to increase your position size. E.g. 1:100 leverage means $1 controls $100.'],
  ['Margin', 'The deposit required to open a leveraged position.'],
  ['Stop Loss', 'An order to automatically close a trade at a specified loss level to limit risk.'],
  ['Take Profit', 'An order to automatically close a trade when a profit target is reached.'],
  ['Candlestick', 'A chart representation showing open, high, low, and close prices in a given period.'],
  ['Support', 'A price level where buying interest is strong enough to prevent further decline.'],
  ['Resistance', 'A price level where selling pressure prevents further price rise.'],
  ['Trend', 'The general direction of market price movement — uptrend, downtrend, or sideways.'],
  ['Liquidity', 'How easily an asset can be bought or sold without affecting its price.'],
  ['Volatility', 'The degree of price variation over time. High volatility = bigger price swings.'],
  ['Risk/Reward', 'The ratio of potential profit to potential loss on a trade. 1:2 means risk $1 to gain $2.'],
  ['Pips Gained', 'The number of pip movements in your favour across trades.'],
  ['Bull Market', 'A rising market where prices are trending upward.'],
  ['Bear Market', 'A falling market where prices are trending downward.'],
  ['Order Types', 'Market order (instant execution), Limit order (execute at specific price), Stop order.'],
  ['MT4/MT5', 'MetaTrader 4/5 — industry-standard trading platforms used by most brokers.'],
  ['SMC', 'Smart Money Concepts — an approach based on how institutional traders (banks) move markets.'],
];

function PipCalc() {
  const [pair, setPair] = useState('EURUSD');
  const [lots, setLots] = useState('');
  const [pips, setPips] = useState('');
  const pipValue = lots && pips ? (Number(lots) * Number(pips) * 10).toFixed(2) : null;
  return (
    <div className="card card-premium">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ fontSize: '1.8rem' }}>💰</div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 2 }}>Pip Value Calculator</h3>
          <p style={{ color: '#9a9a9a', fontSize: '0.78rem' }}>USD value of your pips</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label>Currency Pair</label>
          <input value={pair} onChange={e => setPair(e.target.value)} placeholder="EURUSD" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label>Lot Size</label>
            <input type="number" value={lots} onChange={e => setLots(e.target.value)} placeholder="1.00" step="0.01" min="0" />
          </div>
          <div className="form-group">
            <label>Number of Pips</label>
            <input type="number" value={pips} onChange={e => setPips(e.target.value)} placeholder="50" min="0" />
          </div>
        </div>
        {pipValue && (
          <div style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#9a9a9a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Pip Value</div>
            <div className="mono" style={{ fontSize: '2rem', fontWeight: 900, color: '#c9a84c', lineHeight: 1 }}>${pipValue}</div>
            <div style={{ fontSize: '0.72rem', color: '#9a9a9a', marginTop: 8 }}>{lots} lot(s) × {pips} pips</div>
          </div>
        )}
      </div>
    </div>
  );
}

function PositionCalc() {
  const [balance, setBalance] = useState('');
  const [risk, setRisk] = useState('');
  const [slPips, setSlPips] = useState('');
  const lotSize = balance && risk && slPips
    ? Math.max(0.01, (Number(balance) * Number(risk) / 100) / (Number(slPips) * 10)).toFixed(2)
    : null;
  const riskAmount = balance && risk ? (Number(balance) * Number(risk) / 100).toFixed(2) : null;
  return (
    <div className="card card-premium">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ fontSize: '1.8rem' }}>📊</div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 2 }}>Position Size</h3>
          <p style={{ color: '#9a9a9a', fontSize: '0.78rem' }}>Right lot size for your risk</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label>Account Balance ($)</label>
            <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="1000" min="0" />
          </div>
          <div className="form-group">
            <label>Risk (%)</label>
            <input type="number" value={risk} onChange={e => setRisk(e.target.value)} placeholder="1" step="0.1" min="0" max="100" />
          </div>
        </div>
        <div className="form-group">
          <label>Stop Loss (pips)</label>
          <input type="number" value={slPips} onChange={e => setSlPips(e.target.value)} placeholder="30" min="0" />
        </div>
        {lotSize && (
          <div style={{ background: 'linear-gradient(135deg,rgba(14,203,129,0.12),rgba(14,203,129,0.04))', border: '1px solid rgba(14,203,129,0.3)', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9a9a9a', fontSize: '0.82rem' }}>Recommended Lot Size</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0ecb81' }}>{lotSize}</span>
            </div>
            <div style={{ height: '1px', background: 'rgba(14,203,129,0.2)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9a9a9a', fontSize: '0.78rem' }}>Max Risk at Stop Loss</span>
              <span className="mono" style={{ fontWeight: 700, color: '#fff' }}>${riskAmount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RRCalc() {
  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [dir, setDir] = useState('BUY');

  let rr = null, risk = null, reward = null;
  if (entry && sl && tp) {
    const e = Number(entry), s = Number(sl), t = Number(tp);
    if (dir === 'BUY') { risk = Math.abs(e - s); reward = Math.abs(t - e); }
    else { risk = Math.abs(s - e); reward = Math.abs(e - t); }
    rr = risk > 0 ? (reward / risk).toFixed(2) : null;
  }

  const isGood = rr && Number(rr) >= 2;

  return (
    <div className="card card-premium">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ fontSize: '1.8rem' }}>⚖️</div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 2 }}>Risk / Reward</h3>
          <p style={{ color: '#9a9a9a', fontSize: '0.78rem' }}>Calculate R:R before entry</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label>Direction</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['BUY', 'SELL'].map(d => (
              <button key={d} type="button" onClick={() => setDir(d)}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: `2px solid ${d === dir ? (d === 'BUY' ? '#0ecb81' : '#f6465d') : 'rgba(255,255,255,0.1)'}`, background: d === dir ? (d === 'BUY' ? 'rgba(14,203,129,0.15)' : 'rgba(246,70,93,0.15)') : 'rgba(255,255,255,0.03)', color: d === dir ? (d === 'BUY' ? '#0ecb81' : '#f6465d') : '#9a9a9a', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                {d === 'BUY' ? '🟢 BUY' : '🔴 SELL'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Entry</label>
            <input type="number" value={entry} onChange={e => setEntry(e.target.value)} placeholder="1.0850" step="0.0001" />
          </div>
          <div className="form-group">
            <label>Stop Loss</label>
            <input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder="1.0800" step="0.0001" />
          </div>
          <div className="form-group">
            <label>Take Profit</label>
            <input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder="1.0950" step="0.0001" />
          </div>
        </div>
        {rr && (
          <div style={{ background: isGood ? 'linear-gradient(135deg,rgba(14,203,129,0.12),rgba(14,203,129,0.04))' : 'linear-gradient(135deg,rgba(255,152,0,0.12),rgba(255,152,0,0.04))', border: isGood ? '1px solid rgba(14,203,129,0.3)' : '1px solid rgba(255,152,0,0.3)', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9a9a9a', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1 }}>Risk : Reward</span>
              <span className="mono" style={{ fontWeight: 900, fontSize: '1.8rem', color: isGood ? '#0ecb81' : '#ff9800' }}>1 : {rr}</span>
            </div>
            <div style={{ height: '1px', background: isGood ? 'rgba(14,203,129,0.2)' : 'rgba(255,152,0,0.2)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ color: '#9a9a9a', fontSize: '0.75rem', marginBottom: 4 }}>Risk Pips</div>
                <div className="mono" style={{ color: '#f6465d', fontWeight: 700, fontSize: '1.1rem' }}>{(risk! * 10000).toFixed(1)}</div>
              </div>
              <div>
                <div style={{ color: '#9a9a9a', fontSize: '0.75rem', marginBottom: 4 }}>Reward Pips</div>
                <div className="mono" style={{ color: '#0ecb81', fontWeight: 700, fontSize: '1.1rem' }}>{(reward! * 10000).toFixed(1)}</div>
              </div>
            </div>
            <div style={{ background: isGood ? 'rgba(14,203,129,0.08)' : 'rgba(255,152,0,0.08)', borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${isGood ? '#0ecb81' : '#ff9800'}`, marginTop: 4 }}>
              <p style={{ fontSize: '0.78rem', color: isGood ? '#0ecb81' : '#ff9800', fontWeight: 600, margin: 0 }}>
                {isGood ? '✓ Excellent setup. Trade this!' : '⚠ Consider a better setup. Aim for 1:2+.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TABS = ['Calculators', 'Glossary'];

export default function Resources() {
  const [tab, setTab] = useState('Calculators');
  const [glossarySearch, setGlossarySearch] = useState('');
  const filteredGlossary = GLOSSARY.filter(([term, def]) =>
    term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    def.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <DashboardLayout title="Trading Resources" subtitle="Free tools, calculators, and references to sharpen your trading skills.">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 6, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: tab === t ? '#c9a84c' : 'transparent', color: tab === t ? '#0d0d0d' : '#9a9a9a', fontWeight: tab === t ? 700 : 500, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Calculators' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(420px,1fr))', gap: 24 }}>
            <PositionCalc />
            <RRCalc />
          </div>
          <div>
            <PipCalc />
          </div>
        </div>
      )}

      {tab === 'Glossary' && (
        <div className="card card-premium">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>📚 Forex Glossary</h2>
              <input
                type="text"
                placeholder="Search glossary... (e.g., 'pip', 'leverage')"
                value={glossarySearch}
                onChange={e => setGlossarySearch(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, color: '#fff', fontSize: '0.9rem' }}
              />
              {glossarySearch && <div style={{ fontSize: '0.78rem', color: '#9a9a9a', marginTop: 8 }}>{filteredGlossary.length} result{filteredGlossary.length !== 1 ? 's' : ''}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {(glossarySearch ? filteredGlossary : GLOSSARY).map(([term, def]) => (
                <div key={term} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px,auto) 1fr', gap: 20, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'start' }}>
                  <div style={{ fontWeight: 700, color: '#c9a84c', fontSize: '0.9rem' }}>{term}</div>
                  <div style={{ fontSize: '0.85rem', color: '#c8c8c8', lineHeight: 1.6 }}>{def}</div>
                </div>
              ))}
              {glossarySearch && filteredGlossary.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9a9a9a', fontSize: '0.9rem' }}>
                  No results for "{glossarySearch}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

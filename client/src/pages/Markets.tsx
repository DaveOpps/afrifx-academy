import { useState } from 'react';
import PageShell from '../components/PageShell';
import TradingViewWidget from '../components/TradingViewWidget';

// Instruments offered in the academy (TradingView symbol format).
const PAIRS = [
  { tv: 'OANDA:EURUSD', label: 'EUR/USD' },
  { tv: 'OANDA:GBPUSD', label: 'GBP/USD' },
  { tv: 'OANDA:USDJPY', label: 'USD/JPY' },
  { tv: 'OANDA:AUDUSD', label: 'AUD/USD' },
  { tv: 'OANDA:USDCAD', label: 'USD/CAD' },
  { tv: 'OANDA:XAUUSD', label: 'Gold' },
  { tv: 'BINANCE:BTCUSDT', label: 'BTC/USDT' },
  { tv: 'BINANCE:ETHUSDT', label: 'ETH/USDT' },
];

export default function Markets() {
  const [symbol, setSymbol] = useState(PAIRS[0].tv);

  return (
    <PageShell title="Live Markets" subtitle="Professional real-time charts, indicators and analysis — powered by TradingView.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Symbol tabs */}
        <div className="card card-premium">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PAIRS.map(p => (
              <button key={p.tv} onClick={() => setSymbol(p.tv)}
                className={`btn btn-sm ${symbol === p.tv ? 'btn-gold' : 'btn-outline'}`}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Chart + technical analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 20 }} className="mk-grid">
          <div className="card card-premium" style={{ padding: 8 }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
              height={560}
              config={{
                autosize: true,
                symbol,
                interval: 'D',
                timezone: 'Etc/UTC',
                theme: 'dark',
                style: '1',
                locale: 'en',
                allow_symbol_change: true,
                hide_side_toolbar: false,
                calendar: false,
                support_host: 'https://www.tradingview.com',
              }}
            />
          </div>

          <div className="card card-premium" style={{ padding: 8 }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
              height={560}
              config={{
                interval: '1D',
                width: '100%',
                isTransparent: true,
                height: '100%',
                symbol,
                showIntervalTabs: true,
                displayMode: 'single',
                locale: 'en',
                colorTheme: 'dark',
              }}
            />
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.76rem' }}>
          Charts &amp; data provided by TradingView. For education only — not financial advice.
        </p>
      </div>

      <style>{`@media (max-width: 820px){ .mk-grid { grid-template-columns: 1fr !important; } }`}</style>
    </PageShell>
  );
}

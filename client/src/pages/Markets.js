import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(PageShell, { title: "Live Markets", subtitle: "Professional real-time charts, indicators and analysis \u2014 powered by TradingView.", children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsx("div", { className: "card card-premium", children: _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: PAIRS.map(p => (_jsx("button", { onClick: () => setSymbol(p.tv), className: `btn btn-sm ${symbol === p.tv ? 'btn-gold' : 'btn-outline'}`, children: p.label }, p.tv))) }) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 20 }, className: "mk-grid", children: [_jsx("div", { className: "card card-premium", style: { padding: 8 }, children: _jsx(TradingViewWidget, { scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js", height: 560, config: {
                                        width: '100%',
                                        height: 560,
                                        symbol,
                                        interval: 'D',
                                        timezone: 'Etc/UTC',
                                        theme: 'dark',
                                        style: '1',
                                        locale: 'en',
                                        allow_symbol_change: false,
                                        hide_side_toolbar: false,
                                        calendar: false,
                                        support_host: 'https://www.tradingview.com',
                                    } }) }), _jsx("div", { className: "card card-premium", style: { padding: 8 }, children: _jsx(TradingViewWidget, { scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js", height: 560, config: {
                                        interval: '1D',
                                        width: '100%',
                                        isTransparent: true,
                                        height: 560,
                                        symbol,
                                        showIntervalTabs: true,
                                        displayMode: 'single',
                                        locale: 'en',
                                        colorTheme: 'dark',
                                    } }) })] }), _jsx("p", { style: { textAlign: 'center', color: '#666', fontSize: '0.76rem' }, children: "Charts & data provided by TradingView. For education only \u2014 not financial advice." })] }), _jsx("style", { children: `@media (max-width: 820px){ .mk-grid { grid-template-columns: 1fr !important; } }` })] }));
}

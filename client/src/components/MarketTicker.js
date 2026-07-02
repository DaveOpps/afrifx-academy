import { jsx as _jsx } from "react/jsx-runtime";
import TradingViewWidget from './TradingViewWidget';
// Scrolling live price ticker, powered by TradingView (global data, no geo-block).
export default function MarketTicker() {
    return (_jsx("div", { style: { borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(160deg,#15151a,#101013)' }, children: _jsx(TradingViewWidget, { scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js", config: {
                symbols: [
                    { proName: 'OANDA:EURUSD', title: 'EUR/USD' },
                    { proName: 'OANDA:GBPUSD', title: 'GBP/USD' },
                    { proName: 'OANDA:USDJPY', title: 'USD/JPY' },
                    { proName: 'OANDA:AUDUSD', title: 'AUD/USD' },
                    { proName: 'OANDA:XAUUSD', title: 'Gold' },
                    { proName: 'BINANCE:BTCUSDT', title: 'BTC/USDT' },
                    { proName: 'BINANCE:ETHUSDT', title: 'ETH/USDT' },
                ],
                showSymbolLogo: true,
                isTransparent: true,
                displayMode: 'adaptive',
                colorTheme: 'dark',
                locale: 'en',
            } }) }));
}

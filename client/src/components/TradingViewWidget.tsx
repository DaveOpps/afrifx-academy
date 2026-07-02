import { useEffect, useRef, memo } from 'react';

interface Props {
  /** The TradingView embed script URL (e.g. .../embed-widget-advanced-chart.js) */
  scriptSrc: string;
  /** Widget configuration object (serialized into the script). */
  config: Record<string, unknown>;
  /** Container height. Omit for self-sizing widgets like the ticker tape. */
  height?: number | string;
}

// Generic TradingView embeddable-widget host. Injects the official embed script
// with a JSON config into a container div. Re-injects when the config changes.
function TradingViewWidget({ scriptSrc, config, height }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(config);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML =
      '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.innerHTML = key;
    container.appendChild(script);
    return () => { container.innerHTML = ''; };
  }, [scriptSrc, key]);

  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%' }}
    />
  );
}

export default memo(TradingViewWidget);

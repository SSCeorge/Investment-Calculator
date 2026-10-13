import { useState, useEffect, useCallback } from "react";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export default function CryptoData() {
  const [size, setSize] = useState(10);
  const [globalData, setGlobalData] = useState(null);
  const [topCoins, setTopCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://api.coinpaprika.com/v1/global");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setGlobalData(json);
      } catch (err) {
        console.error("Global fetch failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://api.coinpaprika.com/v1/tickers?limit=${size}`
      );
      if (!res.ok) throw new Error(`Tickers API error: ${res.status}`);
      const json = await res.json();
      setTopCoins(Array.isArray(json) ? json.slice(0, size) : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Crypto fetch failed:", err);
      setError(err.message || "Failed to load cryptocurrency data.");
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="crypto-data">
      <div className="crypto-header">
        <h3>Cryptocurrency Market Overview</h3>
        <div className="crypto-header-actions">
          <div className="size-toggle" role="group" aria-label="Number of coins">
            <button
              type="button"
              className={size === 10 ? "active" : ""}
              onClick={() => setSize(10)}
              aria-pressed={size === 10}
            >
              Top 10
            </button>
            <button
              type="button"
              className={size === 20 ? "active" : ""}
              onClick={() => setSize(20)}
              aria-pressed={size === 20}
            >
              Top 20
            </button>
          </div>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && <p className="error-msg">⚠ {error}</p>}

      {globalData && (
        <div className="global-stats">
          <p>
            <span>Market Cap:</span>{" "}
            {formatter.format(globalData.market_cap_usd ?? 0)}
          </p>
          <p>
            <span>24h Volume:</span>{" "}
            {formatter.format(globalData.volume_24h_usd ?? 0)}
          </p>
          <p>
            <span>BTC Dominance:</span>{" "}
            {globalData.bitcoin_dominance_percentage?.toFixed(2) ?? "–"}%
          </p>
          <p>
            <span>Coins tracked:</span>{" "}
            {globalData.cryptocurrencies_number ?? "–"}
          </p>
        </div>
      )}

      <h4>Top {size} Cryptocurrencies</h4>

      {loading && !topCoins.length ? (
        <p>Loading cryptocurrency data…</p>
      ) : topCoins.length ? (
        <div className="crypto-table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Symbol</th>
                <th>Price</th>
                <th>24h %</th>
                <th>Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {topCoins.map((coin) => {
                const usd = coin.quotes?.USD ?? {};
                const change = usd.percent_change_24h ?? 0;
                return (
                  <tr key={coin.id}>
                    <td>{coin.rank}</td>
                    <td>{coin.name}</td>
                    <td>{coin.symbol}</td>
                    <td>{formatter.format(usd.price ?? 0)}</td>
                    <td className={change >= 0 ? "up" : "down"}>
                      {change >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(change).toFixed(2)}%
                    </td>
                    <td>{formatter.format(usd.market_cap ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No cryptocurrency data available.</p>
      )}

      {lastUpdated && (
        <p className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
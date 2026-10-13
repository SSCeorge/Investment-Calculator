import { useState, useEffect, useCallback, useMemo } from "react";

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

const WATCHLIST_10 = [
  { symbol: "AAPL",  name: "Apple Inc." },
  { symbol: "MSFT",  name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN",  name: "Amazon.com Inc." },
  { symbol: "TSLA",  name: "Tesla Inc." },
  { symbol: "META",  name: "Meta Platforms" },
  { symbol: "NVDA",  name: "NVIDIA Corp." },
  { symbol: "JPM",   name: "JPMorgan Chase" },
  { symbol: "V",     name: "Visa Inc." },
  { symbol: "WMT",   name: "Walmart Inc." },
];

const WATCHLIST_EXTENDED = [
  { symbol: "BAC",  name: "Bank of America" },
  { symbol: "DIS",  name: "Walt Disney Co." },
  { symbol: "KO",   name: "Coca-Cola Co." },
  { symbol: "PEP",  name: "PepsiCo Inc." },
  { symbol: "XOM",  name: "Exxon Mobil" },
  { symbol: "PFE",  name: "Pfizer Inc." },
  { symbol: "INTC", name: "Intel Corp." },
  { symbol: "CSCO", name: "Cisco Systems" },
  { symbol: "ORCL", name: "Oracle Corp." },
  { symbol: "NKE",  name: "Nike Inc." },
];

const WATCHLIST_20 = [...WATCHLIST_10, ...WATCHLIST_EXTENDED];

const priceFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const capFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

export default function StockData() {
  const [size, setSize] = useState(10);
  const [stocks, setStocks] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const watchlist = useMemo(
    () => (size === 20 ? WATCHLIST_20 : WATCHLIST_10),
    [size]
  );

  /* Profiles — fetch once for the full symbol set */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        WATCHLIST_20.map(({ symbol }) =>
          fetch(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
          ).then((r) => (r.ok ? r.json() : null))
        )
      );
      if (cancelled) return;
      const map = {};
      WATCHLIST_20.forEach(({ symbol }, i) => {
        const res = results[i];
        if (res.status === "fulfilled" && res.value) {
          map[symbol] = res.value;
        }
      });
      setProfiles(map);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        watchlist.map(({ symbol }) =>
          fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
          ).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
        )
      );

      const mapped = watchlist
        .map(({ symbol, name }, i) => {
          const res = results[i];
          if (res.status !== "fulfilled") return null;
          const q = res.value || {};
          if (!q.c || q.c <= 0) return null;
          return {
            symbol,
            name,
            c: q.c,
            d: q.d ?? 0,
            dp: q.dp ?? 0,
          };
        })
        .filter(Boolean);

      setStocks(mapped);
      setLastUpdated(new Date());

      if (mapped.length === 0) {
        setError(
          "No live quotes available for the current watchlist right now."
        );
      }
    } catch (err) {
      console.error("Stock fetch failed:", err);
      setError(err.message || "Failed to load stock data.");
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    if (!stocks.length) return null;

    const totalCapMillions = stocks.reduce((sum, s) => {
      const cap = profiles[s.symbol]?.marketCapitalization ?? 0;
      return sum + cap;
    }, 0);

    const gainers = stocks.filter((s) => s.dp > 0).length;
    const losers = stocks.filter((s) => s.dp < 0).length;
    const avgChange =
      stocks.reduce((sum, s) => sum + s.dp, 0) / stocks.length;

    const sorted = [...stocks].sort((a, b) => b.dp - a.dp);
    const top = sorted[0];
    const worst = sorted[sorted.length - 1];

    return {
      totalCapMillions,
      gainers,
      losers,
      avgChange,
      top,
      worst,
      count: stocks.length,
    };
  }, [stocks, profiles]);

  return (
    <div className="stock-data">
      <div className="crypto-header">
        <h3>Stock Market Watchlist</h3>
        <div className="crypto-header-actions">
          <div className="size-toggle" role="group" aria-label="Number of stocks">
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

      {stats && (
        <div className="global-stats">
          <p>
            <span>Combined Market Cap:</span>{" "}
            {stats.totalCapMillions > 0
              ? capFmt.format(stats.totalCapMillions * 1_000_000)
              : "–"}
          </p>
          <p>
            <span>Advancing / Declining:</span> {stats.gainers} / {stats.losers}
          </p>
          <p>
            <span>Avg Change:</span>{" "}
            <span className={stats.avgChange >= 0 ? "up" : "down"}>
              {stats.avgChange >= 0 ? "+" : ""}
              {stats.avgChange.toFixed(2)}%
            </span>
          </p>
          <p>
            <span>Symbols tracked:</span> {stats.count}
          </p>
          <p>
            <span>Top Gainer:</span> <strong>{stats.top.symbol}</strong>{" "}
            <span className="up">+{stats.top.dp.toFixed(2)}%</span>
          </p>
          <p>
            <span>Top Loser:</span> <strong>{stats.worst.symbol}</strong>{" "}
            <span className={stats.worst.dp >= 0 ? "up" : "down"}>
              {stats.worst.dp.toFixed(2)}%
            </span>
          </p>
        </div>
      )}

      {loading && !stocks.length ? (
        <p>Loading stock data…</p>
      ) : stocks.length ? (
        <div className="crypto-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Industry</th>
                <th>Price</th>
                <th>Change</th>
                <th>% Change</th>
                <th>Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => {
                const cap = profiles[s.symbol]?.marketCapitalization ?? 0;
                const industry =
                  profiles[s.symbol]?.finnhubIndustry ?? "–";
                return (
                  <tr key={s.symbol}>
                    <td>
                      <strong>{s.symbol}</strong>
                    </td>
                    <td>{s.name}</td>
                    <td>{industry}</td>
                    <td>{priceFmt.format(s.c)}</td>
                    <td className={s.d >= 0 ? "up" : "down"}>
                      {s.d >= 0 ? "+" : ""}
                      {s.d.toFixed(2)}
                    </td>
                    <td className={s.dp >= 0 ? "up" : "down"}>
                      {s.dp >= 0 ? "▲" : "▼"} {Math.abs(s.dp).toFixed(2)}%
                    </td>
                    <td>{cap > 0 ? capFmt.format(cap * 1_000_000) : "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No stock data available.</p>
      )}

      {lastUpdated && (
        <p className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
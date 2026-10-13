import { useState } from "react";
import CryptoData from "./CryptoData.jsx";
import StockData from "./StockData.jsx";

export default function MarketView() {
  const [view, setView] = useState("crypto");

  return (
    <div className="view-toggle-container">
      <div className="view-toggle-buttons" role="tablist" aria-label="Market data view">
        <button
          type="button"
          role="tab"
          aria-selected={view === "crypto"}
          className={view === "crypto" ? "active" : ""}
          onClick={() => setView("crypto")}
        >
          Crypto
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "stocks"}
          className={view === "stocks" ? "active" : ""}
          onClick={() => setView("stocks")}
        >
          Stocks
        </button>
      </div>

      <div className="view-panels">
        <div
          className={`view-panel crypto-panel ${view === "crypto" ? "active" : "inactive"}`}
          aria-hidden={view !== "crypto"}
        >
          <CryptoData />
        </div>

        <div
          className={`view-panel stocks-panel ${view === "stocks" ? "active" : "inactive"}`}
          aria-hidden={view !== "stocks"}
        >
          <StockData />
        </div>
      </div>
    </div>
  );
}
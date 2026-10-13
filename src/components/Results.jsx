import { useState } from "react";
import { calculateInvestmentResults } from "../util/investment.js";
import InvestmentChart from "./InvestmentChart.jsx";
import { downloadResultsCsv } from "../util/downloadChart.js";
import { CURRENCY_GROUPS, makeFormatter } from "../util/currency.js";

export default function Results({
  data,
  currency,
  onCurrencyChange,
  fontSize,
  onFontSizeChange,
}) {
  const [view, setView] = useState("table");

  const resultsData = calculateInvestmentResults(data);
  if (resultsData.length === 0) return null;

  const fmt = makeFormatter(currency);
  const final = resultsData[resultsData.length - 1];
  const initialInvestment = data.initialInvestment;

  const summary = [
    { label: "Total Contributed", value: fmt.format(final.totalContributed) },
    {
      label: "Final Value",
      value: fmt.format(final.valueEndOfYear),
      accent: true,
    },
    { label: "Total Interest", value: fmt.format(final.totalInterestEarned) },
    {
      label: "Real Value",
      value: fmt.format(final.realValue),
      title: "Adjusted for inflation, shown in today's money",
    },
    { label: "After-Tax Value", value: fmt.format(final.afterTaxValue) },
  ];

  const handleCsv = () =>
    downloadResultsCsv(
      resultsData,
      `investment-projection-${new Date().toISOString().slice(0, 10)}.csv`
    );

  return (
    <>
      <div className="results-header">
        <h3 className="results-title">Projection</h3>

        <div className="results-controls">
          <div className="font-size-control" role="group" aria-label="Font size">
            <button
              type="button"
              className={`chip-btn ${fontSize === "sm" ? "active" : ""}`}
              onClick={() => onFontSizeChange("sm")}
              aria-pressed={fontSize === "sm"}
              aria-label="Small font"
            >
              A-
            </button>
            <button
              type="button"
              className={`chip-btn ${fontSize === "md" ? "active" : ""}`}
              onClick={() => onFontSizeChange("md")}
              aria-pressed={fontSize === "md"}
              aria-label="Medium font"
            >
              A
            </button>
            <button
              type="button"
              className={`chip-btn ${fontSize === "lg" ? "active" : ""}`}
              onClick={() => onFontSizeChange("lg")}
              aria-pressed={fontSize === "lg"}
              aria-label="Large font"
            >
              A+
            </button>
          </div>

          <label className="currency-picker">
            <span>Currency</span>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              aria-label="Select display currency"
            >
              {CURRENCY_GROUPS.map((group) => (
                <optgroup key={group.region} label={group.region}>
                  {group.currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="summary-cards">
        {summary.map((s) => (
          <div
            key={s.label}
            className={`summary-card ${s.accent ? "accent" : ""}`}
            title={s.title}
          >
            <span className="summary-label">{s.label}</span>
            <span className="summary-value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="view-toggle-results">
        <button
          type="button"
          className={view === "table" ? "active" : ""}
          onClick={() => setView("table")}
          aria-pressed={view === "table"}
        >
          Table
        </button>
        <button
          type="button"
          className={view === "chart" ? "active" : ""}
          onClick={() => setView("chart")}
          aria-pressed={view === "chart"}
        >
          Chart
        </button>
        <button
          type="button"
          className="download-csv-btn"
          onClick={handleCsv}
          aria-label="Download results as CSV"
        >
          ⬇ CSV
        </button>
      </div>

      {view === "table" ? (
        <div className="results-wrap">
          <table id="result">
            <thead>
              <tr>
                <th>Year</th>
                <th>Contributed</th>
                <th>Value</th>
                <th>Real Value</th>
                <th>After-Tax</th>
                <th>Interest (Year)</th>
                <th>Total Interest</th>
              </tr>
            </thead>
            <tbody>
              {resultsData.map((e) => {
                const totalInvestedCapital =
                  e.valueEndOfYear - e.totalInterestEarned;

                return (
                  <tr key={e.year}>
                    <td>{e.year}</td>
                    <td>{fmt.format(totalInvestedCapital)}</td>
                    <td>{fmt.format(e.valueEndOfYear)}</td>
                    <td>{fmt.format(e.realValue)}</td>
                    <td>{fmt.format(e.afterTaxValue)}</td>
                    <td>{fmt.format(e.interest)}</td>
                    <td>{fmt.format(e.totalInterestEarned)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <InvestmentChart
          resultsData={resultsData}
          taxRate={data.taxRate}
          currency={currency}
        />
      )}

      <p className="results-note">
        Starting investment: {fmt.format(initialInvestment)}
      </p>
    </>
  );
}
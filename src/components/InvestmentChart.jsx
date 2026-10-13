import { useRef } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import { downloadSvgAsPng } from "../util/downloadChart.js";
import { makeFormatter, formatCompact } from "../util/currency.js";

const COLORS = {
  contributed: "#307e6c",
  interest: "#83e6c0",
  taxes: "#c0392b",
  realValue: "#f0ad4e",
};

const CHART_BG = "#1c3a32";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

export default function InvestmentChart({ resultsData, taxRate, currency = "USD" }) {
  const growthRef = useRef(null);
  const pieRef = useRef(null);

  const fmt = makeFormatter(currency);
  const compact = (v) => formatCompact(v, currency);

  const final = resultsData[resultsData.length - 1];
  const gains = Math.max(0, final.valueEndOfYear - final.totalContributed);
  const taxes = gains * ((taxRate ?? 0) / 100);
  const netInterest = Math.max(0, final.totalInterestEarned - taxes);

  const pieData = [
    { name: "Contributed", value: final.totalContributed, fill: COLORS.contributed },
    { name: "Net Interest", value: netInterest, fill: COLORS.interest },
    { name: "Taxes", value: taxes, fill: COLORS.taxes },
  ].filter((d) => d.value > 0);

  const tooltipStyle = {
    background: "#1c3a32",
    border: "1px solid #307e6c",
    borderRadius: 6,
    color: "#e1eeeb",
  };
  const labelStyle = { color: "#83e6c0", fontWeight: 600 };

  const dateStamp = new Date().toISOString().slice(0, 10);

  return (
    <div className="investment-chart">
      <div className="chart-block">
        <div className="chart-block-header">
          <h4>Growth over time</h4>
          <button
            type="button"
            className="download-chart-btn"
            onClick={() =>
              downloadSvgAsPng(
                growthRef.current,
                `investment-growth-${dateStamp}.png`,
                { backgroundColor: CHART_BG }
              )
            }
            aria-label="Download growth chart as PNG"
          >
            ⬇ PNG
          </button>
        </div>
        <div ref={growthRef}>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={resultsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
              <XAxis dataKey="year" stroke="#e1eeeb" tickMargin={6} />
              <YAxis stroke="#e1eeeb" tickFormatter={compact} width={70} />
              <Tooltip
                formatter={(value, name) => [fmt.format(value), name]}
                labelFormatter={(l) => `Year ${l}`}
                contentStyle={tooltipStyle}
                labelStyle={labelStyle}
              />
              <Legend wrapperStyle={{ color: "#e1eeeb", paddingTop: 8 }} />
              <Area
                type="monotone"
                dataKey="totalContributed"
                name="Contributed"
                stackId="1"
                stroke={COLORS.contributed}
                fill={COLORS.contributed}
                fillOpacity={0.85}
                isAnimationActive={!prefersReducedMotion}
              />
              <Area
                type="monotone"
                dataKey="totalInterestEarned"
                name="Interest"
                stackId="1"
                stroke={COLORS.interest}
                fill={COLORS.interest}
                fillOpacity={0.85}
                isAnimationActive={!prefersReducedMotion}
              />
              <Line
                type="monotone"
                dataKey="realValue"
                name="Real Value (today's money)"
                stroke={COLORS.realValue}
                strokeWidth={2}
                dot={false}
                isAnimationActive={!prefersReducedMotion}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-block">
        <div className="chart-block-header">
          <h4>Final breakdown (year {final.year})</h4>
          {pieData.length > 0 && (
            <button
              type="button"
              className="download-chart-btn"
              onClick={() =>
                downloadSvgAsPng(
                  pieRef.current,
                  `investment-breakdown-${dateStamp}.png`,
                  { backgroundColor: CHART_BG }
                )
              }
              aria-label="Download breakdown chart as PNG"
            >
              ⬇ PNG
            </button>
          )}
        </div>
        {pieData.length > 0 ? (
          <>
            <div ref={pieRef}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    label={(entry) => `${entry.name}: ${compact(entry.value)}`}
                    labelLine={false}
                    isAnimationActive={!prefersReducedMotion}
                  />
                  <Tooltip
                    formatter={(value) => fmt.format(value)}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="chart-caption">
              After-tax value: <strong>{fmt.format(final.afterTaxValue)}</strong>
            </p>
          </>
        ) : (
          <p className="chart-caption">No positive value to display yet.</p>
        )}
      </div>
    </div>
  );
}
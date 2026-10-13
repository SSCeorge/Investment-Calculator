const SVG_NS = "http://www.w3.org/2000/svg";

function pickLargestSvg(container) {
  if (!container) return null;
  if (container.tagName?.toLowerCase() === "svg") return container;

  const svgs = container.querySelectorAll("svg");
  let best = null;
  let bestArea = 0;
  svgs.forEach((svg) => {
    const r = svg.getBoundingClientRect();
    const area = r.width * r.height;
    if (area > bestArea) {
      bestArea = area;
      best = svg;
    }
  });
  return best;
}

export function downloadSvgAsPng(target, filename, options = {}) {
  const svg = pickLargestSvg(target);
  if (!svg) {
    console.error("downloadSvgAsPng: no SVG found");
    return;
  }

  const { backgroundColor = "#1c3a32", scale = 2 } = options;
  const rect = svg.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || svg.clientWidth || 800));
  const height = Math.max(1, Math.round(rect.height || svg.clientHeight || 400));

  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", SVG_NS);
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  clone.setAttribute("preserveAspectRatio", "xMidYMid meet");

  // Strip things that confuse rasterizers
  clone.removeAttribute("style");
  clone.querySelectorAll("[tabindex]").forEach((el) => el.removeAttribute("tabindex"));
  clone.querySelectorAll("foreignObject").forEach((el) => el.remove());

  const bg = document.createElementNS(SVG_NS, "rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", String(width));
  bg.setAttribute("height", String(height));
  bg.setAttribute("fill", backgroundColor);
  clone.insertBefore(bg, clone.firstChild);

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      URL.revokeObjectURL(url);
      if (!blob) return;
      const pngUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(pngUrl);
    }, "image/png");
  };

  img.onerror = (e) => {
    console.error("Failed to rasterize chart to PNG", e);
    URL.revokeObjectURL(url);
  };

  img.src = url;
}

export function downloadResultsCsv(resultsData, filename) {
  const headers = [
    "Year",
    "Contributed",
    "Value",
    "Real Value",
    "After-Tax",
    "Interest (Year)",
    "Total Interest",
  ];

  const rows = resultsData.map((e) => {
    const contributed = e.valueEndOfYear - e.totalInterestEarned;
    return [
      e.year,
      contributed.toFixed(2),
      e.valueEndOfYear.toFixed(2),
      e.realValue.toFixed(2),
      e.afterTaxValue.toFixed(2),
      e.interest.toFixed(2),
      e.totalInterestEarned.toFixed(2),
    ];
  });

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `investment-projection-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
import { useState, useEffect } from "react";

const isEmptyValue = (v) => {
  if (v === "" || v == null) return true;
  const n = Number(v);
  return Number.isNaN(n) || n === 0;
};

export default function FormattedNumberInput({
  value,
  onChange,
  min,
  max,
  ...rest
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (isFocused) return;
    if (isEmptyValue(value)) {
      setDisplay("");
      return;
    }
    setDisplay(
      Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })
    );
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setDisplay(isEmptyValue(value) ? "" : String(Number(value)));
  };

  const handleBlur = () => {
    setIsFocused(false);
    const n = Number(value);
    if (value === "" || Number.isNaN(n)) return;
    let clamped = n;
    if (min !== undefined && n < min) clamped = min;
    if (max !== undefined && n > max) clamped = max;
    if (clamped !== n) onChange(String(clamped));
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, "");
    if (!/^-?\d*\.?\d*$/.test(raw)) return;
    setDisplay(raw);
    onChange(raw);
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}
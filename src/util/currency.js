export const CURRENCY_GROUPS = [
  {
    region: "Americas",
    currencies: [
      { code: "USD", label: "US Dollar" },
      { code: "CAD", label: "Canadian Dollar" },
      { code: "MXN", label: "Mexican Peso" },
      { code: "BRL", label: "Brazilian Real" },
    ],
  },
  {
    region: "Europe",
    currencies: [
      { code: "EUR", label: "Euro" },
      { code: "GBP", label: "British Pound" },
      { code: "CHF", label: "Swiss Franc" },
      { code: "SEK", label: "Swedish Krona" },
      { code: "NOK", label: "Norwegian Krone" },
    ],
  },
  {
    region: "Asia-Pacific",
    currencies: [
      { code: "JPY", label: "Japanese Yen" },
      { code: "CNY", label: "Chinese Yuan" },
      { code: "HKD", label: "Hong Kong Dollar" },
      { code: "SGD", label: "Singapore Dollar" },
      { code: "KRW", label: "South Korean Won" },
      { code: "INR", label: "Indian Rupee" },
      { code: "AUD", label: "Australian Dollar" },
      { code: "NZD", label: "New Zealand Dollar" },
    ],
  },
  {
    region: "Middle East & Africa",
    currencies: [
      { code: "SAR", label: "Saudi Riyal" },
      { code: "AED", label: "UAE Dirham" },
      { code: "ZAR", label: "South African Rand" },
    ],
  },
];

export const CURRENCIES = CURRENCY_GROUPS.flatMap((g) => g.currencies);

export function makeFormatter(code) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatCompact(value, code) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}
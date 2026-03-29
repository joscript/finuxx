// Currency symbol map
export const CURRENCY_SYMBOLS: Record<string, string> = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
};

/** Returns the display symbol for a currency code (e.g. "USD" → "$"). Falls back to the code itself. */
export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

/** Formats a number as a currency string using the given currency code (e.g. 1500, "USD" → "$1,500"). */
export function formatAmount(amount: number, currencyCode: string = "PHP"): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString()}`;
}

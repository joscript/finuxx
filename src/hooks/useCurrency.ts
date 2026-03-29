import { useAppSelector } from "../store/hooks";
import { formatAmount, getCurrencySymbol } from "../utils/currency";

/**
 * Returns a formatter function that formats a number using the user's selected currency.
 * Usage: const fmt = useCurrency(); → fmt(1500) → "₱1,500" (or "$1,500" etc.)
 */
export function useCurrency(): (amount: number) => string {
  const currency = useAppSelector(
    (state) => state.settings.settings?.currency ?? "PHP",
  );
  return (amount: number) => formatAmount(amount, currency);
}

/**
 * Returns just the currency symbol string for the user's selected currency.
 * Usage: const symbol = useCurrencySymbol(); → "₱" (or "$" etc.)
 */
export function useCurrencySymbol(): string {
  const currency = useAppSelector(
    (state) => state.settings.settings?.currency ?? "PHP",
  );
  return getCurrencySymbol(currency);
}

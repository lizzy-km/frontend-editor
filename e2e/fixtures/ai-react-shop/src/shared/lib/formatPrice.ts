const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Shows a number as a US dollar price, for example $68.00.
export function formatPrice(value: number): string {
  return usd.format(value);
}

const priceFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  currencyDisplay: "symbol",
});

export function formatPrice(price: number): string {
  return priceFormatter.format(price).replace("￥", "¥");
}

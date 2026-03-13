export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDimension(feet: number): string {
  const wholeFeet = Math.floor(feet);
  const inches = Math.round((feet - wholeFeet) * 12);
  if (inches === 0) return `${wholeFeet}'`;
  if (wholeFeet === 0) return `${inches}"`;
  return `${wholeFeet}'-${inches}"`;
}

export function formatFeetInches(inches: number): string {
  const ft = Math.floor(inches / 12);
  const remaining = Math.round(inches % 12);
  if (ft === 0) return `${remaining}"`;
  if (remaining === 0) return `${ft}'`;
  return `${ft}'-${remaining}"`;
}

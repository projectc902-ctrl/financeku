export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return "Rp 0";
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
};

export const parseCurrency = (currencyString: string): number => {
  const cleanedString = currencyString.replace(/[^0-9,-]+/g, "").replace(",", ".");
  const num = parseFloat(cleanedString);
  return isNaN(num) ? 0 : num;
};
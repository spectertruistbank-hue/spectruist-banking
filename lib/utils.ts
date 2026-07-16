export function generateAccountNumber(): string {
  const randomDigits = Math.floor(Math.random() * 10000000000)
    .toString()
    .padStart(10, "0");
  return `ST${randomDigits}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function formatAccountNumber(accountNumber: string): string {
  return `${accountNumber.slice(0, 4)} **** ${accountNumber.slice(-4)}`;
}

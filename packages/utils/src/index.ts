/**
 * Format currency in Naira
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

/**
 * Format phone number to Nigerian format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  
  // If starts with 234, format as international
  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  }
  
  // If starts with 0, replace with +234
  if (cleaned.startsWith("0")) {
    return `+234${cleaned.slice(1)}`;
  }
  
  // Otherwise, assume it needs +234 prefix
  return `+234${cleaned}`;
}

/**
 * Calculate installment schedule
 */
export interface Installment {
  number: number;
  amount: number;
  dueDate: Date;
  status: "pending" | "paid" | "overdue";
}

export function calculateInstallments(
  totalAmount: number,
  numberOfInstallments: number,
  startDate: Date = new Date(),
  frequency: "monthly" | "quarterly" = "monthly"
): Installment[] {
  const installmentAmount = totalAmount / numberOfInstallments;
  const installments: Installment[] = [];
  
  const monthsIncrement = frequency === "monthly" ? 1 : 3;
  
  for (let i = 0; i < numberOfInstallments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i * monthsIncrement);
    
    installments.push({
      number: i + 1,
      amount: installmentAmount,
      dueDate,
      status: "pending",
    });
  }
  
  return installments;
}

/**
 * Generate unique reference code
 */
export function generateReference(prefix: string = "REF"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate commission
 */
export function calculateCommission(
  amount: number,
  rate: number,
  type: "percentage" | "fixed" = "percentage"
): number {
  if (type === "percentage") {
    return (amount * rate) / 100;
  }
  return rate;
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

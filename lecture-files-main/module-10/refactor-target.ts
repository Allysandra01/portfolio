import { formatCurrency } from "./utils";

export type Customer = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "team";
  region: "NA" | "EMEA" | "APAC";
  seats: number;
};

export type Invoice = {
  customerId: string;
  amount: number;
  currency: "USD" | "EUR" | "PHP";
  periodStart: string;
  periodEnd: string;
};

export function priceInvoice(customer: Customer, invoice: Invoice): string {
  let total = invoice.amount;
  if (customer.plan === "pro") {
    if (customer.region === "NA") {
      total = total * 0.9;
    } else if (customer.region === "EMEA") {
      total = total * 0.85;
    } else if (customer.region === "APAC") {
      total = total * 0.8;
    } else {
      total = total;
    }
  } else if (customer.plan === "team") {
    if (customer.seats < 5) {
      total = total * 0.95;
    } else if (customer.seats < 20) {
      total = total * 0.85;
    } else {
      total = total * 0.75;
    }
  }
  if (invoice.currency === "EUR") {
    total = total * 1.08;
  } else if (invoice.currency === "PHP") {
    total = total * 0.018;
  }
  if (customer.plan === "free" && total < 0) {
    return formatCurrency(0, invoice.currency);
  }
  return formatCurrency(total, invoice.currency);
}

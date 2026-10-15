// "2025-05-01" is parsed by Date as UTC midnight, which shows the previous
// day in US time zones. Parse date-only strings as local dates instead.
export const parseDate = (value) => {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value) => parseDate(value)?.toLocaleDateString() ?? "—";

export const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

export const orderTotal = (order) =>
  (order.lines || []).reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);

const KEY = "orderly_recent_orders";

export function pushRecentOrder(order) {
  const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
  const filtered = existing.filter((o) => o.id !== order.id);
  const updated = [{ id: order.id, customerName: order.customerName }, ...filtered].slice(0, 5);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

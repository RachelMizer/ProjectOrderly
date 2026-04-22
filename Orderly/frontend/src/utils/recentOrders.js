const KEY = "orderly_recent_orders";

export function pushRecentOrder(order) {
  const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
  const filtered = existing.filter((o) => o.id !== order.id);
  const firstName = order.customerFirstName || "";
  const lastName = order.customerLastName || "";
  const customerName = `${firstName} ${lastName}`.trim() || null;
  const updated = [{ id: order.id, customerName }, ...filtered].slice(0, 5);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function removeRecentOrder(id) {
  const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
  localStorage.setItem(KEY, JSON.stringify(existing.filter((o) => o.id !== id)));
}

export function clearRecentOrders() {
  localStorage.removeItem(KEY);
}

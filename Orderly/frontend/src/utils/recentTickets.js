const KEY = "support_recent_tickets";

export function getRecentTickets() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRecentTicket(ticket) {
  const recent = getRecentTickets().filter((t) => t.id !== ticket.id);
  recent.unshift({
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
  });
  localStorage.setItem(KEY, JSON.stringify(recent.slice(0, 10)));
}

export function setRecentTickets(tickets) {
  localStorage.setItem(KEY, JSON.stringify(tickets.slice(0, 10)));
}

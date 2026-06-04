import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_HOST from "../../config";
import { getAuthHeaders } from "../../api/auth";

const API      = `${API_HOST}/api/v1`;
const SCHED_API = `${API_HOST}/api/v1/store-manager/schedule`;

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates() {
  const today = new Date();
  const day   = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmt12(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour   = h % 12 || 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

function CurrentWeekGrid({ storeName }) {
  const [shifts, setShifts]           = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);

  const weekDates = getWeekDates();

  useEffect(() => {
    async function load() {
      try {
        // Fetch months needed (week may span two months)
        const monthKeys = [...new Set(weekDates.map(d => `${d.getFullYear()}-${d.getMonth() + 1}`))];
        const results   = await Promise.all(
          monthKeys.map(ym => {
            const [y, m] = ym.split("-");
            return fetch(`${SCHED_API}/month/?year=${y}&month=${m}`, { headers: getAuthHeaders() })
              .then(r => r.ok ? r.json() : { shifts: [], assignments: [] });
          })
        );

        const allShifts      = results[0]?.shifts ?? [];
        const allAssignments = results.flatMap(r => r.assignments ?? []);
        const weekIso        = new Set(weekDates.map(isoDate));

        setShifts(allShifts);
        setAssignments(allAssignments.filter(a => weekIso.has(a.date)));
      } catch {
        // fail silently — schedule section just won't populate
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const today = isoDate(new Date());

  // Build lookup: dateStr → shiftId → [employeeName, ...]
  const byDayShift = {};
  assignments.forEach(a => {
    if (!byDayShift[a.date])           byDayShift[a.date]           = {};
    if (!byDayShift[a.date][a.shiftId]) byDayShift[a.date][a.shiftId] = [];
    byDayShift[a.date][a.shiftId].push(a.employeeName.split(" ")[0]);
  });

  return (
    <div className="emp-week-section">
      <h2 className="emp-week-title">This Week</h2>
      {loading ? (
        <p className="admin-loading" style={{ fontSize: ".85rem" }}>Loading schedule…</p>
      ) : (
        <div className="emp-week-grid">
          {weekDates.map((d, i) => {
            const dateStr  = isoDate(d);
            const isToday  = dateStr === today;
            const daySlots = byDayShift[dateStr] ?? {};

            return (
              <div
                key={dateStr}
                className={["emp-week-cell", isToday ? "emp-week-cell--today" : ""].filter(Boolean).join(" ")}
              >
                <div className="emp-week-cell__header">
                  <span className="emp-week-cell__day">{WEEK_DAYS[i]}</span>
                  <span className="emp-week-cell__date">
                    {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>

                {shifts.length === 0 ? null : (
                  <div className="emp-week-cell__shifts">
                    {shifts.map(shift => {
                      const emps = daySlots[shift.id] ?? [];
                      if (emps.length === 0) return null;
                      return (
                        <div key={shift.id} className="emp-week-cell__shift-group">
                          <span className="emp-week-cell__shift-name">
                            {shift.name}
                          </span>
                          {emps.map((name, idx) => (
                            <div key={idx} className="emp-week-cell__emp">{name}</div>
                          ))}
                        </div>
                      );
                    })}
                    {Object.keys(daySlots).length === 0 && (
                      <span className="emp-week-cell__empty">—</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StoreManagerEmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/users/store-manager/employees/`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data.results || []);
          setStoreName(data.storeName || "");
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.detail || "Failed to load employees.");
        }
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = employees.filter((e) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const name = [e.firstName, e.lastName].filter(Boolean).join(" ").toLowerCase();
    return (
      name.includes(term) ||
      e.email?.toLowerCase().includes(term) ||
      e.username?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="ticket-detail__title">Employee Management</h1>
          {storeName && (
            <p style={{ color: "#64748b", marginTop: "2px", fontSize: ".9rem" }}>{storeName}</p>
          )}
        </div>
        <span className="roster__count">
          {loading ? "…" : `${employees.length} ${employees.length === 1 ? "employee" : "employees"}`}
        </span>
      </div>

      <CurrentWeekGrid storeName={storeName} />

      <div className="acct-page-controls" style={{ marginTop: "28px" }}>
        <div className="acct-page-controls__left">
          <label className="acct-search-label">Search employees</label>
          <input
            className="acct-search-input"
            type="text"
            placeholder="Name, email, username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="admin-loading">Loading…</p>
      ) : error ? (
        <p className="admin-loading" style={{ color: "#ef4444" }}>{error}</p>
      ) : filtered.length === 0 ? (
        <div className="my-tickets__empty">
          <p className="my-tickets__empty-icon">👤</p>
          <p className="my-tickets__empty-heading">
            {search ? "No employees match your search" : "No employees assigned to your store"}
          </p>
        </div>
      ) : (
        <table className="support-ticket-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id}>
                <td>{[emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.username}</td>
                <td>{emp.username}</td>
                <td>{emp.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="ticket-detail__footer">
        <button className="support-back-btn" onClick={() => navigate("/admin")}>
          <strong>←</strong> Back to Dashboard
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_HOST from "../../config";
import { getAuthHeaders } from "../../api/auth";

const API = `${API_HOST}/api/v1/store-manager/schedule`;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function fmt12(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2,"0")}${suffix}`;
}

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function isoDate(year, month, day) {
  return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

export default function StoreSchedulePage() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [shifts, setShifts]           = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [addingShift, setAddingShift]   = useState(null);
  const [addEmpId, setAddEmpId]         = useState("");
  const [saving, setSaving]             = useState(false);

  // Shift management modal
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [newShift, setNewShift] = useState({ name: "", startTime: "", endTime: "" });
  const [shiftError, setShiftError] = useState("");

  const loadMonth = useCallback(async (y, m) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/month/?year=${y}&month=${m}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load schedule.");
      const data = await res.json();
      setShifts(data.shifts || []);
      setAssignments(data.assignments || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${API_HOST}/api/v1/users/store-manager/employees/`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.results || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadMonth(year, month);
    loadEmployees();
  }, [year, month, loadMonth, loadEmployees]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  // Assignments indexed by "date|shiftId" for easy lookup
  const assignByDayShift = {};
  assignments.forEach(a => {
    const key = `${a.date}|${a.shiftId}`;
    if (!assignByDayShift[key]) assignByDayShift[key] = [];
    assignByDayShift[key].push(a);
  });

  const selectedDateStr = selectedDate
    ? isoDate(year, month, selectedDate)
    : null;

  async function addAssignment() {
    if (!addEmpId || !addingShift || !selectedDateStr) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/assignments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          shift_id: addingShift,
          employee_id: parseInt(addEmpId),
          date: selectedDateStr,
        }),
      });
      if (!res.ok) throw new Error("Failed to add assignment.");
      const a = await res.json();
      setAssignments(prev => [...prev.filter(x => x.id !== a.id), a]);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
      setAddEmpId("");
      setAddingShift(null);
    }
  }

  async function removeAssignment(id) {
    setSaving(true);
    try {
      const res = await fetch(`${API}/assignments/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to remove.");
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function createShift() {
    setShiftError("");
    if (!newShift.name.trim() || !newShift.startTime || !newShift.endTime) {
      setShiftError("Name, start time, and end time are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/shifts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name: newShift.name.trim(),
          startTime: newShift.startTime,
          endTime: newShift.endTime,
          sort_order: shifts.length,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.name?.[0] || d.detail || "Failed to create shift.");
      }
      const s = await res.json();
      setShifts(prev => [...prev, s]);
      setNewShift({ name: "", startTime: "", endTime: "" });
      setShowShiftModal(false);
    } catch (e) {
      setShiftError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteShift(shiftId) {
    if (!window.confirm("Delete this shift type? All assignments for it will also be removed.")) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/shifts/${shiftId}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete shift.");
      setShifts(prev => prev.filter(s => s.id !== shiftId));
      setAssignments(prev => prev.filter(a => a.shiftId !== shiftId));
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    const rows = [["Date", "Day", "Shift", "Start", "End", "Employee"]];
    const sorted = [...assignments].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    sorted.forEach(a => {
      const shift = shifts.find(s => s.id === a.shiftId);
      const d = new Date(a.date + "T00:00:00");
      rows.push([
        a.date,
        d.toLocaleDateString("en-US", { weekday: "short" }),
        shift?.name || "",
        shift ? fmt12(shift.startTime) : "",
        shift ? fmt12(shift.endTime) : "",
        `"${a.employeeName}"`,
      ]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule-${year}-${String(month).padStart(2,"0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const weeks = buildCalendarGrid(year, month);

  // Employees not yet assigned to a given shift on the selected date
  function availableEmployees(shiftId) {
    const assigned = new Set(
      assignments
        .filter(a => a.date === selectedDateStr && a.shiftId === shiftId)
        .map(a => a.employeeId)
    );
    return employees.filter(e => !assigned.has(e.id));
  }

  return (
    <div className="admin-dash support-dash">
      {/* Submenu bar */}
      <div className="submenu-bar">
        <span className="submenu-label">📅 Schedule</span>
        <div className="submenu-actions">
          <button className="submenu-action" onClick={() => setShowShiftModal(true)}>
            ⚙️ MANAGE SHIFTS
          </button>
          <span className="submenu-divider" />
          <button className="submenu-action" onClick={exportCSV} disabled={assignments.length === 0}>
            📤 EXPORT CSV
          </button>
          <button className="submenu-action" onClick={() => window.print()}>
            🖨️ PRINT
          </button>
        </div>
      </div>

      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "20px 0 16px" }}>
        <button className="support-back-btn" onClick={prevMonth}>◀ Prev</button>
        <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#2d2d2d" }}>
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button className="support-back-btn" onClick={nextMonth}>Next ▶</button>
        <span style={{ marginLeft: "auto", color: "#64748b", fontSize: ".85rem" }}>
          {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading && <p className="admin-loading">Loading…</p>}
      {!loading && error && <p className="admin-loading" style={{ color: "#ef4444" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          {/* Calendar grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sched-grid">
              {DAYS.map(d => (
                <div key={d} className="sched-day-header">{d}</div>
              ))}
              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  const dateStr = day ? isoDate(year, month, day) : null;
                  const isToday = dateStr === isoDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
                  const isSelected = day === selectedDate;
                  const dayAssignments = day
                    ? assignments.filter(a => a.date === dateStr)
                    : [];
                  // Group by shift for compact display
                  const byShift = {};
                  dayAssignments.forEach(a => {
                    if (!byShift[a.shiftId]) byShift[a.shiftId] = { name: a.shiftName, emps: [] };
                    byShift[a.shiftId].emps.push(a.employeeName.split(" ")[0]);
                  });

                  return (
                    <div
                      key={`${wi}-${di}`}
                      className={[
                        "sched-cell",
                        !day ? "sched-cell--empty" : "",
                        isToday ? "sched-cell--today" : "",
                        isSelected ? "sched-cell--selected" : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => day && setSelectedDate(day === selectedDate ? null : day)}
                    >
                      {day && (
                        <>
                          <span className="sched-cell__date">{day}</span>
                          <div className="sched-cell__shifts">
                            {Object.values(byShift).map(s => (
                              <div key={s.name} className="sched-cell__shift-group">
                                <span className="sched-cell__shift-name">{s.name}</span>
                                {s.emps.map((emp, i) => (
                                  <div key={i} className="sched-cell__emp-row">{emp}</div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Day panel */}
          {selectedDate && (
            <div className="sched-panel">
              <div className="sched-panel__header">
                <span>
                  {new Date(isoDate(year, month, selectedDate) + "T00:00:00")
                    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
                <button
                  className="sched-panel__close"
                  onClick={() => { setSelectedDate(null); setAddingShift(null); setAddEmpId(""); }}
                >✕</button>
              </div>

              {shifts.length === 0 ? (
                <p style={{ color: "#94a3b8", padding: "12px 0", fontSize: ".85rem" }}>
                  No shift types defined. Use "Manage Shifts" to add some.
                </p>
              ) : (
                shifts.map(shift => {
                  const key = `${selectedDateStr}|${shift.id}`;
                  const slotAssignments = assignByDayShift[key] || [];
                  const avail = availableEmployees(shift.id);

                  return (
                    <div key={shift.id} className="sched-panel__shift">
                      <div className="sched-panel__shift-header">
                        <strong>{shift.name}</strong>
                        <span className="sched-panel__shift-time">
                          {fmt12(shift.startTime)} – {fmt12(shift.endTime)}
                        </span>
                      </div>

                      {slotAssignments.length === 0 ? (
                        <p className="sched-panel__empty">No one scheduled</p>
                      ) : (
                        <div className="sched-panel__emps">
                          {slotAssignments.map(a => (
                            <span key={a.id} className="sched-panel__emp-chip">
                              {a.employeeName}
                              <button
                                className="sched-panel__emp-remove"
                                onClick={() => removeAssignment(a.id)}
                                disabled={saving}
                                title="Remove"
                              >×</button>
                            </span>
                          ))}
                        </div>
                      )}

                      {addingShift === shift.id ? (
                        <div className="sched-panel__add-row">
                          <select
                            className="sched-panel__select"
                            value={addEmpId}
                            onChange={e => setAddEmpId(e.target.value)}
                          >
                            <option value="">— select employee —</option>
                            {avail.map(e => (
                              <option key={e.id} value={e.id}>
                                {[e.firstName, e.lastName].filter(Boolean).join(" ") || e.username}
                              </option>
                            ))}
                          </select>
                          <button
                            className="sched-panel__add-btn"
                            onClick={addAssignment}
                            disabled={!addEmpId || saving}
                          >Add</button>
                          <button
                            className="sched-panel__cancel-btn"
                            onClick={() => { setAddingShift(null); setAddEmpId(""); }}
                          >Cancel</button>
                        </div>
                      ) : (
                        <button
                          className="sched-panel__assign-btn"
                          onClick={() => { setAddingShift(shift.id); setAddEmpId(""); }}
                          disabled={avail.length === 0}
                        >
                          {avail.length === 0 ? "All assigned" : "+ Add employee"}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Manage Shifts modal */}
      {showShiftModal && (
        <div className="sched-modal-overlay" onClick={() => setShowShiftModal(false)}>
          <div className="sched-modal" onClick={e => e.stopPropagation()}>
            <div className="sched-modal__header">
              <span>Manage Shift Types</span>
              <button className="sched-panel__close" onClick={() => setShowShiftModal(false)}>✕</button>
            </div>

            {shifts.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: ".85rem", marginBottom: "12px" }}>No shifts defined yet.</p>
            ) : (
              <table className="support-ticket-table" style={{ marginBottom: "16px" }}>
                <thead>
                  <tr><th>Name</th><th>Start</th><th>End</th><th></th></tr>
                </thead>
                <tbody>
                  {shifts.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{fmt12(s.startTime)}</td>
                      <td>{fmt12(s.endTime)}</td>
                      <td>
                        <button
                          className="sched-panel__emp-remove"
                          style={{ fontSize: ".8rem", padding: "2px 8px" }}
                          onClick={() => deleteShift(s.id)}
                          disabled={saving}
                        >Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <p style={{ fontWeight: 600, marginBottom: "8px", color: "#334155" }}>Add new shift</p>
            {shiftError && <p style={{ color: "#ef4444", fontSize: ".85rem", marginBottom: "8px" }}>{shiftError}</p>}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label className="acct-field-label">Name</label>
                <input
                  className="acct-field-input"
                  placeholder="e.g. Morning"
                  value={newShift.name}
                  onChange={e => setNewShift(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="acct-field-label">Start</label>
                <input
                  className="acct-field-input"
                  type="time"
                  value={newShift.startTime}
                  onChange={e => setNewShift(p => ({ ...p, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="acct-field-label">End</label>
                <input
                  className="acct-field-input"
                  type="time"
                  value={newShift.endTime}
                  onChange={e => setNewShift(p => ({ ...p, endTime: e.target.value }))}
                />
              </div>
              <button
                className="ticket-action-btn ticket-action-btn--save"
                onClick={createShift}
                disabled={saving}
              >Add Shift</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

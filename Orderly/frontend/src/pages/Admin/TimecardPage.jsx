import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API_HOST from "../../config";
import { getAuthHeaders } from "../../api/auth";

const TC_API  = `${API_HOST}/api/v1/timecard`;
const PP_API  = `${API_HOST}/api/v1/store-manager/pay-periods`;

function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function fmtHours(h) {
  if (h == null) return "—";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function toLocalInputDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TimecardPage({ userRole }) {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [data, setData]         = useState(null);
  const [payPeriods, setPayPeriods] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Filter state
  const today = new Date();
  const thirtyAgo = new Date(today); thirtyAgo.setDate(today.getDate() - 30);
  const [filterMode, setFilterMode]     = useState("range");   // "range" | "period"
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [startDate, setStartDate]       = useState(thirtyAgo.toISOString().slice(0,10));
  const [endDate, setEndDate]           = useState(today.toISOString().slice(0,10));

  // Punch edit/add state
  const [addingPunch, setAddingPunch]   = useState(false);
  const [newPunch, setNewPunch]         = useState({ timestamp: "", punch_type: "IN", note: "" });
  const [editingPunch, setEditingPunch] = useState(null);  // { id, timestamp, punch_type, note }
  const [saving, setSaving]             = useState(false);
  const [saveErr, setSaveErr]           = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${TC_API}/${userId}/`;
      if (filterMode === "period" && selectedPeriod) {
        url += `?pay_period=${selectedPeriod}`;
      } else {
        url += `?start=${startDate}T00:00:00&end=${endDate}T23:59:59`;
      }
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Failed to load timecard.");
      }
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, filterMode, selectedPeriod, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch(`${PP_API}/`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setPayPeriods(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  async function addPunch() {
    setSaveErr("");
    if (!newPunch.timestamp || !newPunch.punch_type) {
      setSaveErr("Timestamp and type are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${TC_API}/${userId}/punches/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(newPunch),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Failed to add punch.");
      }
      setAddingPunch(false);
      setNewPunch({ timestamp: "", punch_type: "IN", note: "" });
      load();
    } catch (e) {
      setSaveErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function savePunchEdit() {
    setSaveErr("");
    setSaving(true);
    try {
      const res = await fetch(`${TC_API}/punches/${editingPunch.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          timestamp: editingPunch.timestamp,
          punch_type: editingPunch.punch_type,
          note: editingPunch.note,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Failed to save.");
      }
      setEditingPunch(null);
      load();
    } catch (e) {
      setSaveErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deletePunch(id) {
    if (!window.confirm("Delete this punch record?")) return;
    setSaving(true);
    try {
      const res = await fetch(`${TC_API}/punches/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Failed to delete.");
      }
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    if (!data) return;
    const rows = [["Date", "Clock In", "Clock Out", "Hours"]];
    (data.sessions || []).forEach(s => {
      rows.push([
        s.date,
        s.clockIn ? fmtDateTime(s.clockIn) : "—",
        s.clockOut ? fmtDateTime(s.clockOut) : "Open",
        s.hours != null ? s.hours : "—",
      ]);
    });
    rows.push([]);
    rows.push(["Total Hours", "", "", data.totalHours]);
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `timecard-${data.employee?.name?.replace(/ /g,"_") || userId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const canEdit = data?.canEdit;

  // Group sessions by date for the daily breakdown
  const sessionsByDate = {};
  (data?.sessions || []).forEach(s => {
    if (!sessionsByDate[s.date]) sessionsByDate[s.date] = [];
    sessionsByDate[s.date].push(s);
  });
  const sortedDates = Object.keys(sessionsByDate).sort();

  return (
    <div className="admin-dash support-dash">
      {/* Submenu bar */}
      <div className="submenu-bar">
        <span className="submenu-label">🕐 Timecard</span>
        <div className="submenu-actions">
          <button className="submenu-action" onClick={exportCSV} disabled={!data || loading}>
            📤 EXPORT CSV
          </button>
          <button className="submenu-action" onClick={() => window.print()}>
            🖨️ PRINT
          </button>
        </div>
      </div>

      {/* Employee header */}
      {data && (
        <div className="ticket-detail__header" style={{ marginBottom: "16px", marginTop: "12px" }}>
          <div>
            <h1 className="ticket-detail__title">{data.employee.name}</h1>
            <p style={{ color: "#64748b", fontSize: ".88rem", margin: "2px 0 0" }}>
              {data.employee.jobTitle && <>{data.employee.jobTitle} · </>}
              {data.employee.storeName}
              {data.employee.employeeId && <> · <span style={{ fontFamily: "monospace" }}>{data.employee.employeeId}</span></>}
            </p>
          </div>
          <div className="tc-total-badge">
            <span className="tc-total-label">Period Total</span>
            <span className="tc-total-hours">{fmtHours(data.totalHours)}</span>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="emp-prof-card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label className="acct-field-label">Filter by</label>
            <select
              className="rpt-month-select"
              value={filterMode}
              onChange={e => setFilterMode(e.target.value)}
            >
              <option value="range">Date Range</option>
              <option value="period">Pay Period</option>
            </select>
          </div>

          {filterMode === "range" ? (
            <>
              <div>
                <label className="acct-field-label">Start</label>
                <input className="acct-field-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="acct-field-label">End</label>
                <input className="acct-field-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </>
          ) : (
            <div>
              <label className="acct-field-label">Pay Period</label>
              <select className="rpt-month-select" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
                <option value="">— select —</option>
                {payPeriods.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <button className="ticket-action-btn ticket-action-btn--save" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Apply"}
          </button>
        </div>
      </div>

      {loading && <p className="admin-loading">Loading…</p>}
      {!loading && error && <p className="admin-loading" style={{ color: "#ef4444" }}>{error}</p>}

      {!loading && !error && data && (
        <>
          {/* Add punch panel */}
          {canEdit && (
            <div style={{ marginBottom: "12px" }}>
              {addingPunch ? (
                <div className="emp-prof-card">
                  <p className="emp-prof-section-title">Add Punch Record</p>
                  {saveErr && <p style={{ color: "#ef4444", fontSize: ".85rem", marginBottom: "8px" }}>{saveErr}</p>}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div>
                      <label className="acct-field-label">Date &amp; Time</label>
                      <input
                        className="acct-field-input"
                        type="datetime-local"
                        value={newPunch.timestamp}
                        onChange={e => setNewPunch(p => ({ ...p, timestamp: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="acct-field-label">Type</label>
                      <select
                        className="rpt-month-select"
                        value={newPunch.punch_type}
                        onChange={e => setNewPunch(p => ({ ...p, punch_type: e.target.value }))}
                      >
                        <option value="IN">Clock In</option>
                        <option value="OUT">Clock Out</option>
                      </select>
                    </div>
                    <div>
                      <label className="acct-field-label">Note (optional)</label>
                      <input
                        className="acct-field-input"
                        placeholder="e.g. Correction"
                        value={newPunch.note}
                        onChange={e => setNewPunch(p => ({ ...p, note: e.target.value }))}
                      />
                    </div>
                    <button className="sched-panel__add-btn" onClick={addPunch} disabled={saving}>Add</button>
                    <button className="sched-panel__cancel-btn" onClick={() => { setAddingPunch(false); setSaveErr(""); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="sched-panel__assign-btn" onClick={() => setAddingPunch(true)}>
                  + Add Punch Record
                </button>
              )}
            </div>
          )}

          {saveErr && !addingPunch && (
            <p style={{ color: "#ef4444", fontSize: ".85rem", marginBottom: "8px" }}>{saveErr}</p>
          )}

          {/* Daily breakdown */}
          {sortedDates.length === 0 ? (
            <div className="my-tickets__empty">
              <p className="my-tickets__empty-icon">🕐</p>
              <p className="my-tickets__empty-heading">No punch records for this period.</p>
            </div>
          ) : (
            sortedDates.map(dateStr => {
              const sessions = sessionsByDate[dateStr];
              const dayTotal = data.dailyTotals[dateStr] ?? 0;

              return (
                <div key={dateStr} className="tc-day-block">
                  <div className="tc-day-header">
                    <span className="tc-day-label">{fmtDate(dateStr)}</span>
                    <span className="tc-day-total">{fmtHours(dayTotal)}</span>
                  </div>

                  <table className="support-ticket-table tc-punch-table">
                    <thead>
                      <tr>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Duration</th>
                        {canEdit && <th></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s, i) => {
                        const inPunch  = data.punches.find(p => p.id === s.punchInId);
                        const outPunch = data.punches.find(p => p.id === s.punchOutId);

                        if (editingPunch && (editingPunch.id === s.punchInId || editingPunch.id === s.punchOutId)) {
                          const isEditingIn = editingPunch.id === s.punchInId;
                          return (
                            <tr key={i}>
                              <td colSpan={canEdit ? 3 : 2}>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: ".8rem", color: "#64748b" }}>
                                    Editing: <strong>{isEditingIn ? "Clock In" : "Clock Out"}</strong>
                                  </span>
                                  <input
                                    className="acct-field-input"
                                    type="datetime-local"
                                    style={{ fontSize: ".8rem" }}
                                    value={toLocalInputDateTime(editingPunch.timestamp)}
                                    onChange={e => setEditingPunch(p => ({ ...p, timestamp: e.target.value }))}
                                  />
                                  <select
                                    className="rpt-month-select"
                                    value={editingPunch.punch_type}
                                    onChange={e => setEditingPunch(p => ({ ...p, punch_type: e.target.value }))}
                                  >
                                    <option value="IN">Clock In</option>
                                    <option value="OUT">Clock Out</option>
                                  </select>
                                  <input
                                    className="acct-field-input"
                                    placeholder="Note"
                                    style={{ fontSize: ".8rem" }}
                                    value={editingPunch.note}
                                    onChange={e => setEditingPunch(p => ({ ...p, note: e.target.value }))}
                                  />
                                  <button className="sched-panel__add-btn" style={{ fontSize: ".75rem" }} onClick={savePunchEdit} disabled={saving}>Save</button>
                                  <button className="sched-panel__cancel-btn" style={{ fontSize: ".75rem" }} onClick={() => setEditingPunch(null)}>Cancel</button>
                                  {saveErr && <span style={{ color: "#ef4444", fontSize: ".78rem" }}>{saveErr}</span>}
                                </div>
                              </td>
                              {canEdit && <td></td>}
                            </tr>
                          );
                        }

                        return (
                          <tr key={i} className={s.open ? "tc-row--open" : ""}>
                            <td>
                              <span>{s.clockIn ? fmtTime(s.clockIn) : "—"}</span>
                              {inPunch?.note && <span className="tc-punch-note"> · {inPunch.note}</span>}
                            </td>
                            <td>
                              {s.open
                                ? <span className="tc-open-badge">Still clocked in</span>
                                : <>{s.clockOut ? fmtTime(s.clockOut) : "—"}{outPunch?.note && <span className="tc-punch-note"> · {outPunch.note}</span>}</>
                              }
                            </td>
                            <td>{fmtHours(s.hours)}</td>
                            {canEdit && (
                              <td style={{ whiteSpace: "nowrap" }}>
                                {s.punchInId && inPunch?.editable && (
                                  <button
                                    className="sched-panel__cancel-btn"
                                    style={{ fontSize: ".72rem", marginRight: "3px" }}
                                    onClick={() => setEditingPunch({ id: s.punchInId, timestamp: inPunch.timestamp, punch_type: inPunch.punch_type, note: inPunch.note })}
                                    disabled={saving}
                                  >Edit In</button>
                                )}
                                {s.punchOutId && outPunch?.editable && (
                                  <button
                                    className="sched-panel__cancel-btn"
                                    style={{ fontSize: ".72rem", marginRight: "3px" }}
                                    onClick={() => setEditingPunch({ id: s.punchOutId, timestamp: outPunch.timestamp, punch_type: outPunch.punch_type, note: outPunch.note })}
                                    disabled={saving}
                                  >Edit Out</button>
                                )}
                                {s.punchInId && inPunch?.editable && (
                                  <button
                                    className="sched-panel__emp-remove"
                                    style={{ fontSize: ".78rem", padding: "3px 6px" }}
                                    onClick={() => deletePunch(s.punchInId)}
                                    disabled={saving}
                                    title="Delete clock-in"
                                  >×</button>
                                )}
                                {s.punchOutId && outPunch?.editable && (
                                  <button
                                    className="sched-panel__emp-remove"
                                    style={{ fontSize: ".78rem", padding: "3px 6px" }}
                                    onClick={() => deletePunch(s.punchOutId)}
                                    disabled={saving}
                                    title="Delete clock-out"
                                  >×</button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}

          {/* Period summary */}
          {sortedDates.length > 0 && (
            <div className="tc-summary">
              <div className="tc-summary__row">
                <span>Days worked</span>
                <span>{sortedDates.filter(d => (data.dailyTotals[d] ?? 0) > 0).length}</span>
              </div>
              <div className="tc-summary__row">
                <span>Total hours</span>
                <span><strong>{fmtHours(data.totalHours)}</strong></span>
              </div>
            </div>
          )}
        </>
      )}

      <div className="ticket-detail__footer" style={{ marginTop: "20px" }}>
        <button className="support-back-btn" onClick={() => navigate(-1)}>
          <strong>←</strong> Back
        </button>
      </div>
    </div>
  );
}

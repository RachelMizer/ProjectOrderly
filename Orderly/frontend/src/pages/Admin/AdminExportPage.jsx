import { useState } from "react";
import API_HOST from '../../config';

const BASE = `${API_HOST}/api/v1/reports`;

const EXPORTS = [
  {
    key: "orders",
    label: "Orders",
    description: "All non-draft orders with date, customer, status, and totals.",
    filename: "orders.csv",
    hasDateRange: true,
  },
  {
    key: "products",
    label: "Products",
    description: "Full product catalog with variants, SKUs, pricing, and stock levels.",
    filename: "products.csv",
    hasDateRange: false,
  },
  {
    key: "inventory",
    label: "Inventory",
    description: "All inventory items with current stock quantities, units, and reorder levels.",
    filename: "inventory.csv",
    hasDateRange: false,
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export default function AdminExportPage() {
  const [startDate, setStartDate] = useState(thirtyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  async function handleExport(exportKey) {
    setLoading((prev) => ({ ...prev, [exportKey]: true }));
    setErrors((prev) => ({ ...prev, [exportKey]: "" }));

    const token = localStorage.getItem("accessToken");
    let url = `${BASE}/export/${exportKey}`;
    if (exportKey === "orders") {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const blob = await res.blob();
      const exportInfo = EXPORTS.find((e) => e.key === exportKey);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = exportInfo.filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setErrors((prev) => ({ ...prev, [exportKey]: err.message || "Export failed." }));
    } finally {
      setLoading((prev) => ({ ...prev, [exportKey]: false }));
    }
  }

  return (
    <div className="admin-export-pg">
      <h2>Export Data</h2>
      <p className="admin-export-intro">Download business data as CSV files for use in Excel, Google Sheets, or other tools.</p>

      <div className="admin-export-date-row">
        <label>
          <span>Date Range (Orders)</span>
          <div className="admin-export-date-inputs">
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today()}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </label>
      </div>

      <div className="admin-export-cards">
        {EXPORTS.map((exp) => (
          <div key={exp.key} className="admin-export-card">
            <div className="admin-export-card-body">
              <h3>{exp.label}</h3>
              <p>{exp.description}</p>
              {exp.hasDateRange && (
                <p className="admin-export-date-note">
                  Filtered: {startDate} — {endDate}
                </p>
              )}
            </div>
            <div className="admin-export-card-action">
              {errors[exp.key] && (
                <p className="admin-export-error">{errors[exp.key]}</p>
              )}
              <button
                className="admin-export-btn"
                onClick={() => handleExport(exp.key)}
                disabled={loading[exp.key]}
              >
                {loading[exp.key] ? "Downloading…" : `Download ${exp.label} CSV`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

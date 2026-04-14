import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";
import { fetchProductPerformance, fetchSalesSummary } from "../../api/adminReports";
import { saveRecentView } from "../../utils/recentViews";

const now          = new Date();
const CURRENT_YEAR = String(now.getFullYear());
const CURRENT_MM   = String(now.getMonth() + 1).padStart(2, "0");
const CURRENT_MONTH_KEY = `${CURRENT_MM}-${CURRENT_YEAR}`;

function formatMonthLabel(label) {
  const parts = label.split(" ");
  if (parts.length !== 2) return label.toUpperCase();
  return `${parts[0].slice(0, 3).toUpperCase()} '${parts[1].slice(2)}`;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length || payload[0]?.value === 0) return null;
  return (
    <div className="rpt-tooltip">
      <p className="rpt-tooltip__label">{label}</p>
      <p className="rpt-tooltip__value">
        Revenue: ${parseFloat(payload[0]?.value ?? 0).toLocaleString("en-US", {
          minimumFractionDigits: 2, maximumFractionDigits: 2,
        })}
      </p>
      <p className="rpt-tooltip__value">
        Units Sold: {(payload[0]?.payload?.units_sold ?? 0).toLocaleString()}
      </p>
    </div>
  );
}

function formatCurrency(value) {
  return parseFloat(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AdminProductPerformance() {
  const [products, setProducts]           = useState([]);
  const [selectedKey, setSelectedKey]     = useState("");
  const [perfData, setPerfData]           = useState(null);
  const [rankings, setRankings]           = useState([]);
  const [rankLabel, setRankLabel]         = useState("");
  const [availableYears, setAvailableYears]   = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedYear, setSelectedYear]   = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH_KEY);
  const [loading, setLoading]             = useState(true);
  const [dataLoading, setDataLoading]     = useState(false);
  const [error, setError]                 = useState(null);
  const [sortKey, setSortKey]             = useState("units_sold");
  const [sortDir, setSortDir]             = useState("desc");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery]     = useState("");

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIndicator({ col }) {
    if (sortKey !== col)
      return <span className="sort-indicator sort-indicator--inactive">⇅</span>;
    return <span className="sort-indicator">{sortDir === "asc" ? "▲" : "▼"}</span>;
  }

  function getSortValue(item, key) {
    switch (key) {
      case "rank":       return item.rank ?? 0;
      case "name":       return item.name?.toLowerCase() ?? "";
      case "variant":    return item.variant?.toLowerCase() ?? "";
      case "category":   return item.category?.toLowerCase() ?? "";
      case "units_sold": return item.units_sold ?? 0;
      case "revenue":    return parseFloat(item.revenue) ?? 0;
      default:           return "";
    }
  }

  function handleYearChange(year) {
    setSelectedYear(year);
    setSelectedMonth("");
  }

  // On mount: load product list
  useEffect(() => {
    fetchProductPerformance()
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message || "Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  // Rankings: refetch whenever year or month changes
  useEffect(() => {
    fetchSalesSummary({
      year:  selectedYear  || null,
      month: selectedMonth || null,
    })
      .then((data) => {
        setRankings((data.products || []).map((p, i) => ({ ...p, rank: i + 1 })));
        setAvailableYears(data.available_years || []);
        setAvailableMonths(data.available_months || []);
        const monthObj = (data.available_months || []).find((m) => m.value === selectedMonth);
        const sublabel = selectedMonth
          ? (monthObj?.label ?? selectedMonth)
          : selectedYear
            ? `Year-to-Date ${selectedYear}`
            : "All Time";
        setRankLabel(sublabel);
        if (!selectedKey) {
          saveRecentView({
            section:  "reports-products",
            label:    "Product Performance",
            sublabel,
            path:     "/admin/reports/products",
            state:    null,
          });
        }
      })
      .catch(() => {});
  }, [selectedYear, selectedMonth]);

  // Product detail: refetch whenever product or period changes
  useEffect(() => {
    if (!selectedKey) { setPerfData(null); return; }
    const sep     = selectedKey.indexOf("|||");
    const name    = selectedKey.slice(0, sep);
    const variant = selectedKey.slice(sep + 3);
    setDataLoading(true);
    setError(null);
    fetchProductPerformance({
      name,
      variant,
      year:  selectedYear  || null,
      month: selectedMonth || null,
    })
      .then((data) => {
        setPerfData(data.selected);
        const sep     = selectedKey.indexOf("|||");
        const name    = selectedKey.slice(0, sep);
        const variant = selectedKey.slice(sep + 3);
        saveRecentView({
          section:  "reports-products",
          label:    "Product Performance",
          sublabel: `${name} — ${variant}`,
          path:     "/admin/reports/products",
          state:    null,
        });
      })
      .catch((err) => setError(err.message || "Failed to load product data."))
      .finally(() => setDataLoading(false));
  }, [selectedKey, selectedYear, selectedMonth]);

  const searchLower = searchQuery.toLowerCase();

  const filteredProducts = products.filter((p) =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchLower) ||
    p.variant.toLowerCase().includes(searchLower)
  );

  const availableCategories = [
    ...new Set(rankings.map((r) => r.category).filter(Boolean)),
  ].sort();

  const sortedRankings = [...rankings]
    .filter((r) => {
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (searchQuery && !r.name.toLowerCase().includes(searchLower) && !r.variant.toLowerCase().includes(searchLower)) return false;
      return true;
    })
    .sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const isDaily   = perfData?.granularity === "daily";
  const breakdown = perfData?.breakdown ?? [];

  let chartData;
  if (isDaily && selectedMonth) {
    const [mm, yyyy] = selectedMonth.split("-");
    const daysInMonth = new Date(parseInt(yyyy), parseInt(mm), 0).getDate();
    const byDay = Object.fromEntries(
      breakdown.map((row) => [row.label.replace("Day ", ""), row])
    );
    chartData = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = String(i + 1);
      const row = byDay[dayNum];
      return {
        label: row?.label ?? `Day ${dayNum}`,
        date_key: row?.date_key ?? `${yyyy}-${mm}-${String(i + 1).padStart(2, "0")}`,
        units_sold: row?.units_sold ?? 0,
        revenue: row?.revenue ?? 0,
        displayLabel: dayNum,
      };
    });
  } else {
    chartData = breakdown.map((row) => ({
      ...row,
      displayLabel: isDaily ? row.label.replace("Day ", "") : formatMonthLabel(row.label),
    }));
  }

  const bestPeriodLabel = isDaily ? "Best Day" : "Best Month";
  const chartTitle = isDaily
    ? `Daily Revenue — ${(availableMonths.find((m) => m.value === selectedMonth)?.label ?? selectedMonth)}`
    : "Monthly Revenue Trend";

  const periodLabel = selectedMonth
    ? (availableMonths.find((m) => m.value === selectedMonth)?.label ?? selectedMonth)
    : selectedYear
      ? `Year-to-Date ${selectedYear}`
      : "All Time";

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label">Product Performance</span>
        <div className="submenu-actions">
          <div className="submenu-filter-group">
            <input
              className="submenu-search submenu-search--sm"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSelectedKey(""); }}
            />
            {loading ? (
              <span className="rpt-loading" style={{ fontSize: "0.8rem" }}>Loading…</span>
            ) : (
              <select
                className="rpt-month-select rpt-product-select"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
              >
                <option value="">— Select a product —</option>
                {filteredProducts.map((p) => {
                  const key = `${p.name}|||${p.variant}`;
                  return (
                    <option key={key} value={key}>
                      {p.name} — {p.variant}
                    </option>
                  );
                })}
              </select>
            )}
            <select
              className="rpt-month-select"
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
            >
              <option value="">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              className="rpt-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {!selectedKey && availableCategories.length > 0 && (
              <select
                className="rpt-month-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
            {(selectedKey || selectedMonth || searchQuery || categoryFilter || selectedYear !== CURRENT_YEAR) && (
              <button
                type="button"
                className="submenu-action submenu-action--clear"
                onClick={() => {
                  setSelectedKey("");
                  setSelectedYear(CURRENT_YEAR);
                  setSelectedMonth(CURRENT_MONTH_KEY);
                  setCategoryFilter("");
                  setSearchQuery("");
                }}
              >
                &times;&#x202F;CLEAR FILTERS
              </button>
            )}
          </div>
          <span className="submenu-divider" />
          <button type="button" className="submenu-action" title="Pending further development">
            &gt; EXPORT
          </button>
          <button type="button" className="submenu-action" title="Pending further development">
            &gt; PRINT
          </button>
        </div>
      </div>

      {error && <div className="inv-error">{error}</div>}

      {/* Default view — rankings table */}
      {!selectedKey && !loading && (
        <>
          <p className="rpt-period-label">Product Rankings — {rankLabel}</p>
          {sortedRankings.length === 0 ? (
            <p className="rpt-empty">No sales data available for this period.</p>
          ) : (
            <>
              <div className="rpt-rank-legend">
                <span className="rpt-rank-legend__item">
                  <span className="rpt-rank-legend__swatch rpt-rank-legend__swatch--gold" />
                  1st
                </span>
                <span className="rpt-rank-legend__item">
                  <span className="rpt-rank-legend__swatch rpt-rank-legend__swatch--silver" />
                  2nd
                </span>
                <span className="rpt-rank-legend__item">
                  <span className="rpt-rank-legend__swatch rpt-rank-legend__swatch--bronze" />
                  3rd
                </span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-th" onClick={() => handleSort("rank")}>
                      # <SortIndicator col="rank" />
                    </th>
                    <th className="admin-th inv-th-left" onClick={() => handleSort("name")}>
                      Product <SortIndicator col="name" />
                    </th>
                    <th className="admin-th" onClick={() => handleSort("variant")}>
                      Variant <SortIndicator col="variant" />
                    </th>
                    <th className="admin-th" onClick={() => handleSort("category")}>
                      Category <SortIndicator col="category" />
                    </th>
                    <th className="admin-th" onClick={() => handleSort("units_sold")}>
                      Units Sold <SortIndicator col="units_sold" />
                    </th>
                    <th className="admin-th" onClick={() => handleSort("revenue")}>
                      Revenue <SortIndicator col="revenue" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRankings.map((row) => {
                    const rankClass =
                      row.rank === 1 ? "rpt-rank--gold"
                      : row.rank === 2 ? "rpt-rank--silver"
                      : row.rank === 3 ? "rpt-rank--bronze"
                      : "";
                    return (
                      <tr
                        key={`${row.name}-${row.variant}`}
                        className={`rpt-ranking-row${rankClass ? ` ${rankClass}` : ""}`}
                        onClick={() => setSelectedKey(`${row.name}|||${row.variant}`)}
                        title="Click to view full performance"
                      >
                        <td>{row.rank}</td>
                        <td className="inv-td-left td-name">{row.name}</td>
                        <td>{row.variant}</td>
                        <td>{row.category}</td>
                        <td>{row.units_sold.toLocaleString()}</td>
                        <td>${formatCurrency(row.revenue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </>
      )}

      {dataLoading && <div className="rpt-loading">Loading product data…</div>}

      {/* Product detail view */}
      {!dataLoading && perfData && (
        <>
          <p className="rpt-period-label">{perfData.name} — {perfData.variant}</p>
          <p className="rpt-chart-title" style={{ marginBottom: "12px" }}>{periodLabel}</p>

          <div className="rpt-stat-row">
            <div className="rpt-stat-card">
              <p className="rpt-stat-label">Total Revenue</p>
              <p className="rpt-stat-value">${formatCurrency(perfData.total_revenue)}</p>
            </div>
            <div className="rpt-stat-card">
              <p className="rpt-stat-label">Units Sold</p>
              <p className="rpt-stat-value">{perfData.total_units.toLocaleString()}</p>
            </div>
            <div className="rpt-stat-card">
              <p className="rpt-stat-label">{bestPeriodLabel}</p>
              <p className="rpt-stat-value rpt-stat-value--product">{perfData.best_period}</p>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="rpt-chart-wrap">
              <p className="rpt-chart-title">{chartTitle}</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c4d9e8" vertical={false} />
                  <XAxis
                    dataKey="displayLabel"
                    tick={{ fontFamily: "Renner, sans-serif", fontSize: 11, fill: "#2a4f6b", fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                    tick={{ fontFamily: "Renner, sans-serif", fontSize: 11, fill: "#5a85a0" }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(51,99,139,0.08)" }} />
                  <Bar
                    dataKey="revenue"
                    fill="#33638B"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={isDaily ? 20 : 40}
                  >
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={(v) => v === 0 ? "" : v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`}
                      style={{ fontFamily: "Renner, sans-serif", fontSize: isDaily ? 9 : 12, fill: "#2a4f6b", fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <p className="inv-section-header">{isDaily ? "Daily" : "Monthly"} Breakdown</p>

          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th admin-th--no-sort">#</th>
                <th className="admin-th inv-th-left">{isDaily ? "Day" : "Month"}</th>
                <th className="admin-th">Units Sold</th>
                <th className="admin-th">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row, index) => (
                <tr key={row.date_key ?? row.month_key}>
                  <td>{index + 1}</td>
                  <td className="inv-td-left td-name">{row.label}</td>
                  <td>{row.units_sold.toLocaleString()}</td>
                  <td>${formatCurrency(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

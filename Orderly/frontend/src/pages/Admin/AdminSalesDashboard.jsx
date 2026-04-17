import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";
import { fetchSalesSummary } from "../../api/adminReports";
import { saveRecentView } from "../../utils/recentViews";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

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
        Orders: {(payload[0]?.payload?.orders ?? 0).toLocaleString()}
      </p>
    </div>
  );
}

export default function AdminSalesDashboard() {
  const location = useLocation();
  const initMonth = location.state?.month || "";
  const initYear  = initMonth
    ? initMonth.split("-")[1]
    : String(new Date().getFullYear());

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedYear, setSelectedYear] = useState(initYear);
  const [selectedMonth, setSelectedMonth] = useState(initMonth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("units_sold");
  const [sortDir, setSortDir] = useState("desc");

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function getSortValue(item, key) {
    switch (key) {
      case "rank":       return item.rank ?? 0;
      case "name":       return item.name?.toLowerCase() ?? "";
      case "variant":    return item.variant?.toLowerCase() ?? "";
      case "unit_price": return parseFloat(item.unit_price) ?? 0;
      case "units_sold": return item.units_sold ?? 0;
      case "revenue":    return parseFloat(item.revenue) ?? 0;
      default:           return "";
    }
  }

  function SortIndicator({ col }) {
    if (sortKey !== col)
      return <span className="sort-indicator sort-indicator--inactive">⇅</span>;
    return <span className="sort-indicator">{sortDir === "asc" ? "▲" : "▼"}</span>;
  }

  function formatCurrency(value) {
    return parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function handleYearChange(year) {
    setSelectedYear(year);
    setSelectedMonth("");
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSalesSummary({
      year:  selectedYear  || null,
      month: selectedMonth || null,
    })
      .then((data) => {
        setStats({
          totalRevenue: parseFloat(
            data.totalRevenue ?? data.total_revenue ?? 0
          ),
          orderCount: Number(
            data.totalOrders ?? data.order_count ?? 0
          ),
        });
        setProducts(data.products || []);
        const rawBreakdown = data.breakdown || [];
        const groupBy = data.groupBy || "month";
        const mapped = rawBreakdown.map((item) => {
          const date = new Date(item.period + "T00:00:00");
          const label = groupBy === "day"
            ? String(date.getDate())
            : MONTH_NAMES[date.getMonth()];
          return { label, revenue: item.revenue, orders: item.orders };
        });
        if (groupBy === "month") {
          const byLabel = Object.fromEntries(mapped.map((m) => [m.label, m]));
          setChartData(MONTH_NAMES.map((month) => byLabel[month] || { label: month, revenue: 0, orders: 0 }));
        } else {
          setChartData(mapped);
        }
        setAvailableYears(data.availableYears || []);
        setAvailableMonths(data.availableMonths || []);
        const monthObj = (data.available_months || []).find((m) => m.value === selectedMonth);
        const sublabel = selectedMonth
          ? (monthObj?.label ?? selectedMonth)
          : selectedYear
            ? selectedYear
            : "All Years";
        saveRecentView({
          section:  "reports-sales",
          label:    "Sales Summary",
          sublabel,
          path:     "/admin/reports/sales",
          state:    selectedMonth ? { month: selectedMonth } : null,
        });
      })
      .catch((err) => setError(err.message || "Failed to load sales data."))
      .finally(() => setLoading(false));
  }, [selectedYear, selectedMonth]);

  const filteredProducts = [...products]
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variant.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const topProduct = products[0] ?? null;

  const topProductLabel = selectedMonth
    ? `Top Selling Product for ${availableMonths.find((m) => m.value === selectedMonth)?.label ?? selectedMonth}`
    : selectedYear
      ? `Top Selling Product for ${selectedYear}`
      : "Top Selling Product";

  const periodLabel = selectedMonth
    ? availableMonths.find((m) => m.value === selectedMonth)?.label ?? selectedMonth
    : selectedYear
      ? `Year-to-Date Sales for ${selectedYear}`
      : "All Years";

  const chartXLabel = selectedMonth
    ? `Day — ${availableMonths.find((m) => m.value === selectedMonth)?.label ?? selectedMonth}`
    : "Month";

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label">Sales Summary</span>
        <div className="submenu-actions">
          <div className="submenu-filter-group">
            <input
              className="submenu-search submenu-search--sm"
              type="text"
              placeholder="Search product or variant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
            {(searchQuery || selectedYear || selectedMonth) && (
              <button
                type="button"
                className="submenu-action submenu-action--clear"
                onClick={() => { setSearchQuery(""); setSelectedYear(""); setSelectedMonth(""); }}
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

      {loading && (
        <div className="rpt-loading">Loading sales data...</div>
      )}

      {error && (
        <div className="inv-error">{error}</div>
      )}

      {!loading && !error && (
        <>
          <p className="rpt-period-label">{periodLabel}</p>

          {/* Stat tiles — UX5.4.2 / UX5.4.3 */}
          <div className="rpt-stat-row">
            <div className="rpt-stat-card">
              <p className="rpt-stat-label">Total Revenue</p>
              {stats ? (
                <p className="rpt-stat-value">${formatCurrency(stats.totalRevenue)}</p>
              ) : (
                <p className="rpt-empty">No data available.</p>
              )}
            </div>
            <div className="rpt-stat-card">
              <p className="rpt-stat-label">Units Sold</p>
              {stats ? (
                <p className="rpt-stat-value">{stats.orderCount.toLocaleString()}</p>
              ) : (
                <p className="rpt-empty">No data available.</p>
              )}
            </div>
            <div className="rpt-stat-card">
              <p className="rpt-stat-label">{topProductLabel}</p>
              {topProduct ? (
                <>
                  <p className="rpt-stat-value rpt-stat-value--product">{topProduct.name} — {topProduct.variant}</p>
                  <div className="rpt-stat-subrow">
                    <p className="rpt-stat-sublabel">Total Sales: ${formatCurrency(topProduct.revenue)}</p>
                    <p className="rpt-stat-sublabel">Units Sold: {topProduct.units_sold.toLocaleString()}</p>
                  </div>
                </>
              ) : (
                <p className="rpt-empty">No data available.</p>
              )}
            </div>
          </div>

          {/* Bar chart */}
          {chartData.length > 0 && (
            <div className="rpt-chart-wrap">
              <p className="rpt-chart-title">Revenue by {chartXLabel}</p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 20, right: 16, left: 16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c4d9e8" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickFormatter={(v) => isNaN(v) ? v.toUpperCase() : v}
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
                  <Bar dataKey="revenue" fill="#33638B" radius={[3, 3, 0, 0]} maxBarSize={selectedMonth ? 20 : 40}>
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={(v) => v === 0 ? "" : v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`}
                      style={{ fontFamily: "Renner, sans-serif", fontSize: selectedMonth ? 9 : 12, fill: "#2a4f6b", fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Products table — UX5.4.4 */}
          <p className="inv-section-header">Sales by Product</p>

          {filteredProducts.length === 0 ? (
            <p className="rpt-empty">
              {searchQuery ? "No results match your search." : "No sales data to display yet."}
            </p>
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
                    <th className="admin-th" onClick={() => handleSort("unit_price")}>
                      Unit Price <SortIndicator col="unit_price" />
                    </th>
                    <th className="admin-th" onClick={() => handleSort("units_sold")}>
                      Units Sold <SortIndicator col="units_sold" />
                    </th>
                    <th className="admin-th" onClick={() => handleSort("revenue")}>
                      Total Revenue <SortIndicator col="revenue" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const rankClass =
                      product.rank === 1 ? "rpt-rank--gold"
                      : product.rank === 2 ? "rpt-rank--silver"
                      : product.rank === 3 ? "rpt-rank--bronze"
                      : "";
                    return (
                      <tr key={`${product.name}-${product.variant}`} className={rankClass}>
                        <td>{product.rank}</td>
                        <td className="inv-td-left td-name">{product.name}</td>
                        <td>{product.variant}</td>
                        <td>${formatCurrency(product.unit_price)}</td>
                        <td>{product.units_sold.toLocaleString()}</td>
                        <td>${formatCurrency(product.revenue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";
import { fetchSalesSummary } from "../../api/adminReports";

const MONTH_TO_NUM = {
  "January": "01", "February": "02", "March": "03",    "April": "04",
  "May": "05",      "June": "06",      "July": "07",    "August": "08",
  "September": "09","October": "10",   "November": "11","December": "12",
};

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

const ALL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Reports() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = String(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalesSummary({ year: currentYear })
      .then((data) => {
        const raw = data.breakdown || [];
        const byLabel = Object.fromEntries(raw.map((m) => {
          const month = ALL_MONTHS[new Date(m.period + "T00:00:00").getMonth()];
          return [month, { label: month, revenue: m.revenue, orders: m.orders }];
        }));
        const padded = ALL_MONTHS.map((month) => byLabel[month] || { label: month, revenue: 0, orders: 0 });
        setChartData(padded);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleBarClick(data) {
    if (!data || data.revenue === 0) return;
    const mm = MONTH_TO_NUM[data.label];
    if (mm) navigate("/admin/reports/sales", { state: { month: `${mm}-${currentYear}` } });
  }

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label"><span style={{marginRight:"-1px"}}>📊</span>Reports</span>
        <div className="submenu-actions">
        </div>
      </div>

      {!loading && (
        <div className="rpt-chart-wrap">
          <p className="rpt-chart-title"><span style={{marginRight:"-1px"}}>📅</span>Revenue by Month — {currentYear}</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c4d9e8" vertical={false} />
              <XAxis
                dataKey="label"
                tickFormatter={(v) => v.slice(0, 3).toUpperCase()}
                tick={{ fontFamily: "Renner, sans-serif", fontSize: 13, fill: "#2a4f6b", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                tick={{ fontFamily: "Renner, sans-serif", fontSize: 13, fill: "#2a4f6b", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(51,99,139,0.08)" }} />
              <Bar
                dataKey="revenue"
                fill="#33638B"
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
                onClick={handleBarClick}
                style={{ cursor: "pointer" }}
              >
                <LabelList
                  dataKey="revenue"
                  position="top"
                  formatter={(v) => v === 0 ? "" : v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`}
                  style={{ fontFamily: "Renner, sans-serif", fontSize: 12, fill: "#2a4f6b", fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rpt-nav-section">
        <p className="rpt-nav-section__header">Generate a Report</p>
        <div className="rpt-hub-grid">
          <Link to="/admin/reports/sales" className="rpt-hub-card">
            <p className="rpt-hub-card__title"><span style={{marginRight:"-1px"}}>💰</span>Sales Summary</p>
            <p className="rpt-hub-card__desc">
              Total revenue, order count, and top-selling products.
            </p>
          </Link>
          <Link to="/admin/reports/products" className="rpt-hub-card">
            <p className="rpt-hub-card__title rpt-hub-card__title--tight"><span style={{marginRight:"-1px"}}>📈</span>Product Performance</p>
            <p className="rpt-hub-card__desc">
              Monthly revenue trend, units sold, and best month per product.
            </p>
          </Link>
          <div className="rpt-hub-card rpt-hub-card--pending">
            <p className="rpt-hub-card__title">Create Purchase Order</p>
            <p className="rpt-hub-card__desc">
              Create a purchase order based on low-stock inventory.
            </p>
            <span className="rpt-hub-card__badge">Pending further development</span>
          </div>
        </div>
      </div>
    </div>
  );
}

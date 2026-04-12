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
        Units Sold: {(payload[0]?.payload?.units_sold ?? 0).toLocaleString()}
      </p>
    </div>
  );
}

export default function Reports() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = String(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalesSummary({ year: currentYear })
      .then((data) => setChartData(data.chart_data || []))
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
        <span className="submenu-label">Reports</span>
        <div className="submenu-actions">
        </div>
      </div>

      {!loading && chartData.length > 0 && (
        <div className="rpt-chart-wrap">
          <p className="rpt-chart-title">Revenue by Month — {currentYear}</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c4d9e8" vertical={false} />
              <XAxis
                dataKey="label"
                tickFormatter={(v) => v.toUpperCase()}
                tick={{ fontFamily: "Renner, sans-serif", fontSize: 11, fill: "#2a4f6b", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
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
            <p className="rpt-hub-card__title">Sales Summary</p>
            <p className="rpt-hub-card__desc">
              Total revenue, order count, and top-selling products.
            </p>
          </Link>
          <Link to="/admin/reports/products" className="rpt-hub-card">
            <p className="rpt-hub-card__title">Product Performance</p>
            <p className="rpt-hub-card__desc">
              Monthly revenue trend, units sold, and best month per product.
            </p>
          </Link>
          <div className="rpt-hub-card rpt-hub-card--pending">
            <p className="rpt-hub-card__title">Profit Margin / COGS</p>
            <p className="rpt-hub-card__desc">
              Gross margin and cost of goods sold by product and period.
            </p>
            <span className="rpt-hub-card__badge">Pending further development</span>
          </div>
          <div className="rpt-hub-card rpt-hub-card--pending">
            <p className="rpt-hub-card__title">Labor Cost vs. Revenue</p>
            <p className="rpt-hub-card__desc">
              Labor spend as a percentage of revenue by period.
            </p>
            <span className="rpt-hub-card__badge">Pending further development</span>
          </div>
        </div>
      </div>
    </div>
  );
}

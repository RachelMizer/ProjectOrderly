import { Link } from "react-router-dom";

export default function AdminSettingsHub({ userRole }) {
  const isManager  = userRole === "STORE_MANAGER";
  const isExecutive = userRole === "EXECUTIVE";

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label"><span style={{marginRight:"-1px"}}>⚙️</span>Business Information &amp; Settings</span>
      </div>

      <div className="rpt-nav-section">
        <div className="rpt-hub-grid">
          {!isManager && (
            <Link to="/admin/settings/business" className="rpt-hub-card">
              <p className="rpt-hub-card__title"><span style={{marginRight:"-1px"}}>⚙️</span>Business Settings</p>
              <p className="rpt-hub-card__desc">
                Tax rate, business address, contact information, and other operational details.
              </p>
            </Link>
          )}
          {!isManager && (
            <Link to="/admin/settings/storefront" className="rpt-hub-card">
              <p className="rpt-hub-card__title"><span style={{marginRight:"-1px"}}>⚙️</span>Storefront Settings</p>
              <p className="rpt-hub-card__desc">
                Customer-facing details and configuration specific to the online storefront.
              </p>
            </Link>
          )}
          {isExecutive && (
            <Link to="/admin/locations" className="rpt-hub-card">
              <p className="rpt-hub-card__title">📍 Location Management</p>
              <p className="rpt-hub-card__desc">
                View, create, and manage store locations, regions, and manager assignments.
              </p>
            </Link>
          )}
          {isManager && (
            <p style={{ color: "#94a3b8", fontSize: ".9rem", padding: "12px 0" }}>
              No settings available for your role.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

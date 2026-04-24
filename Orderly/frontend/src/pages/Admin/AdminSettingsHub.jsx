import { Link } from "react-router-dom";

export default function AdminSettingsHub() {
  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label"><span style={{marginRight:"-1px"}}>⚙️</span>Settings Management</span>
      </div>

      <div className="rpt-nav-section">
        <div className="rpt-hub-grid">
          <Link to="/admin/settings/business" className="rpt-hub-card">
            <p className="rpt-hub-card__title"><span style={{marginRight:"-1px"}}>⚙️</span>Business Settings</p>
            <p className="rpt-hub-card__desc">
              Tax rate, business address, contact information, and other operational details.
            </p>
          </Link>
          <Link to="/admin/settings/storefront" className="rpt-hub-card">
            <p className="rpt-hub-card__title"><span style={{marginRight:"-1px"}}>⚙️</span>Storefront Settings</p>
            <p className="rpt-hub-card__desc">
              Customer-facing details and configuration specific to the online storefront.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

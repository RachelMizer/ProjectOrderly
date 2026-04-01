import { NavLink } from "react-router-dom";

export default function AdminNav() {
  return (
    <aside className="admin-nav">
      <h2>Admin Dashboard</h2>

      <nav>
        <ul>
          <li>
            <NavLink to="/admin" end>
              Dashboard Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/products">Products</NavLink>
          </li>
          <li>
            <NavLink to="/admin/suppliers">Suppliers</NavLink>
          </li>
          <li>
            <NavLink to="/admin/inventory">Inventory</NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
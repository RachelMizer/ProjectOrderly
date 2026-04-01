import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminNav />

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
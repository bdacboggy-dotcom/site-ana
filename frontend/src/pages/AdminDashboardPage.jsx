import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import AdminAppointmentsTab from "./admin/AdminAppointmentsTab";
import AdminServicesTab from "./admin/AdminServicesTab";
import AdminWorkingHoursTab from "./admin/AdminWorkingHoursTab";
import AdminBlockedDatesTab from "./admin/AdminBlockedDatesTab";

const TABS = [
  { id: "appointments", label: "Programări" },
  { id: "services", label: "Servicii" },
  { id: "hours", label: "Program" },
  { id: "blocked", label: "Zile blocate" },
];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState("appointments");
  const { logout, email } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <>
      <Header title="Panou admin" />
      <div className="container">
        <div className="admin-header" style={{ marginBottom: "0.75rem" }}>
          <span className="text-muted">{email}</span>
          <button type="button" className="logout-link" onClick={handleLogout}>
            Ieși din cont
          </button>
        </div>

        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`admin-tab${tab === t.id ? " admin-tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "appointments" && <AdminAppointmentsTab />}
        {tab === "services" && <AdminServicesTab />}
        {tab === "hours" && <AdminWorkingHoursTab />}
        {tab === "blocked" && <AdminBlockedDatesTab />}
      </div>
    </>
  );
}

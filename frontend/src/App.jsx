import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import BookingPage from "./pages/BookingPage";
import ManageAppointmentPage from "./pages/ManageAppointmentPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/programarea-mea/:token" element={<ManageAppointmentPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

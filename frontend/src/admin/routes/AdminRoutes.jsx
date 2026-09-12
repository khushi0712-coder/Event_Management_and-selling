import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Dashboard";
import Events from "../pages/Events";
import Users from "../pages/Users";
import Bookings from "../pages/Bookings";
import SellTickets from "../pages/SellTickets";
import Contacts from "../pages/Contacts";
import { clearToken, isValidAdminSession } from "../../services/auth";

const AdminRoutes = () => {
  const hasAdminAuth = isValidAdminSession();

  if (!hasAdminAuth) {
    clearToken();
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="" element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="users" element={<Users />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="sell-tickets" element={<SellTickets />} />
        <Route path="contacts" element={<Contacts />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;

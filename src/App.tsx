import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import FacultyDashboard from "@/pages/faculty/dashboard";
import ProfilePage from "@/pages/faculty/profile";
import FacultyFiles from "@/pages/faculty/uploaded";
import SettingsPage from "@/pages/faculty/settings";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAccountsPage from "@/pages/admin/accounts";
import AdminApprovalsPage from "@/pages/admin/approvals";
import AdminAuditLogsPage from "@/pages/admin/audit-logs";
import AdminReportsPage from "@/pages/admin/reports";
import AdminSettingsPage from "@/pages/admin/settings";
import AdminHelpPage from "@/pages/admin/help";
import NotFound from "@/pages/404";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/profile" element={<ProfilePage />} />
        <Route path="/faculty/uploaded" element={<FacultyFiles />} />
        <Route path="/faculty/settings" element={<SettingsPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/accounts" element={<AdminAccountsPage />} />
        <Route path="/admin/approvals" element={<AdminApprovalsPage />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/help" element={<AdminHelpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

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
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        
        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/profile" element={<ProfilePage />} />
        <Route path="/faculty/uploaded" element={<FacultyFiles />} />
        <Route path="/faculty/settings" element={<SettingsPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/accounts" element={<ProtectedRoute requiredRole="admin"><AdminAccountsPage /></ProtectedRoute>} />
        <Route path="/admin/approvals" element={<ProtectedRoute requiredRole="admin"><AdminApprovalsPage /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute requiredRole="admin"><AdminAuditLogsPage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReportsPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettingsPage /></ProtectedRoute>} />
        <Route path="/admin/help" element={<ProtectedRoute requiredRole="admin"><AdminHelpPage /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

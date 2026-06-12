import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "@/pages/404";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SeoRouteMeta } from "@/components/SeoRouteMeta";

const Landing = lazy(() => import("@/pages/landing"));
const Login = lazy(() => import("@/pages/auth/login"));
const Register = lazy(() => import("@/pages/auth/register"));
const FacultyDashboard = lazy(() => import("@/pages/faculty/dashboard"));
const ProfilePage = lazy(() => import("@/pages/faculty/profile"));
const FacultyFiles = lazy(() => import("@/pages/faculty/uploaded"));
const SettingsPage = lazy(() => import("@/pages/faculty/settings"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminAccountsPage = lazy(() => import("@/pages/admin/accounts"));
const AdminApprovalsPage = lazy(() => import("@/pages/admin/approvals"));
const AdminAuditLogsPage = lazy(() => import("@/pages/admin/audit-logs"));
const AdminReportsPage = lazy(() => import("@/pages/admin/reports"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/settings"));
const AdminHelpPage = lazy(() => import("@/pages/admin/help"));
const DemoStoragePreview = lazy(() => import("@/pages/demo-storage"));

const routeFallback = (
  <div role="status" className="min-h-screen bg-slate-950 p-6 text-slate-100">
    Loading screen...
  </div>
);

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SeoRouteMeta />
      <Suspense fallback={routeFallback}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/demo-storage/*" element={<DemoStoragePreview />} />

          {/* Faculty Routes */}
          <Route path="/faculty/dashboard" element={<ProtectedRoute requiredRole="faculty"><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/faculty/profile" element={<ProtectedRoute requiredRole="faculty"><ProfilePage /></ProtectedRoute>} />
          <Route path="/faculty/uploaded" element={<ProtectedRoute requiredRole="faculty"><FacultyFiles /></ProtectedRoute>} />
          <Route path="/faculty/settings" element={<ProtectedRoute requiredRole="faculty"><SettingsPage /></ProtectedRoute>} />

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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

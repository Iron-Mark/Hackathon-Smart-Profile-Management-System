import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState, useEffect } from "react";
import getFromDatabase from "@/tools/database/getFromDatabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/use-document-title";
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A288FE', '#00F49F', '#F0BB28', '#F08042'];
const chartTooltipStyle = {
  backgroundColor: 'var(--popover)',
  borderColor: 'var(--border)',
  color: 'var(--popover-foreground)'
};

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard');
  const [usersCount, setUsersCount] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [uploadData, setUploadData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleExportCSV = async () => {
    try {
      const submissions = await getFromDatabase({ table: 'submissions', getAll: true, match: {} });
      if (!submissions || submissions.length === 0) return;
      
      const keys = Object.keys(submissions[0]);
      const csv = [
        keys.join(','),
        ...submissions.map((row: any) => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'submissions_export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export CSV failed", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accounts = await getFromDatabase({ table: 'account_details', getAll: true, match: {} });
        setUsersCount(accounts.length);

        const submissions = await getFromDatabase({ table: 'submissions', getAll: true, match: {} });
        
        const pending = submissions.filter((sub: any) => sub.status === "Pending");
        setPendingApprovals(pending.length);
        setRecentSubmissions(pending.slice(0, 5));

        const logs = await getFromDatabase({ table: 'audit_logs', getAll: true, match: { action: 'LOGIN' } });
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeUsers = new Set(
          logs
            .filter((log: any) => new Date(log.timestamp) > oneDayAgo)
            .map((log: any) => log.user_id)
        );
        setActiveSessions(activeUsers.size);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const last7Days: any[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          last7Days.push({
            name: days[d.getDay()],
            date: d.toISOString().split('T')[0],
            uploads: 0
          });
        }

        submissions.forEach((sub: any) => {
          if (sub.submitted_at) {
            const subDate = new Date(sub.submitted_at);
            const diffTime = today.getTime() - subDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
              const dayName = days[subDate.getDay()];
              const dayEntry = last7Days.find(d => d.name === dayName);
              if (dayEntry) {
                dayEntry.uploads += 1;
              }
            }
          }
        });
        setUploadData(last7Days.map(d => ({ name: d.name, uploads: d.uploads })));

        const categories: Record<string, number> = {};
        submissions.forEach((sub: any) => {
          const type = sub.document_type || 'Other';
          categories[type] = (categories[type] || 0) + 1;
        });
        setCategoryData(Object.entries(categories).map(([name, value]) => ({ name, value })));

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-muted/40 text-foreground p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-extrabold text-foreground">
                Admin Dashboard
              </h1>
              <Button onClick={handleExportCSV}>Export CSV</Button>
            </div>
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg transition-shadow border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-100">
                <CardHeader>
                  <CardTitle className="text-sm">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-12" /> : usersCount}</div>
                </CardContent>
              </Card>

              <Card className="shadow-lg transition-shadow border-green-200 bg-green-50 text-green-950 dark:border-green-900/70 dark:bg-green-950/50 dark:text-green-100">
                <CardHeader>
                  <CardTitle className="text-sm">Active Sessions (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-12" /> : activeSessions}</div>
                </CardContent>
              </Card>

              <Card className="shadow-lg transition-shadow border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-100">
                <CardHeader>
                  <CardTitle className="text-sm">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-12" /> : pendingApprovals}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Documents Uploaded (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] text-muted-foreground">
                  {isLoading ? <Skeleton className="w-full h-full" /> : (
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 300 }}>
                      <BarChart data={uploadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
                        <YAxis tick={{ fill: 'currentColor' }} />
                        <RechartsTooltip contentStyle={chartTooltipStyle} labelStyle={{ color: 'var(--popover-foreground)' }} />
                        <Bar dataKey="uploads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Document Categories</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] text-muted-foreground">
                  {isLoading ? <Skeleton className="w-full h-full" /> : (
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 300 }}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={{ fill: 'currentColor' }}
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={chartTooltipStyle} labelStyle={{ color: 'var(--popover-foreground)' }} />
                        <Legend wrapperStyle={{ color: 'currentColor' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-foreground">
                  Recent Submissions for Approval
                </h2>
                <input
                  type="text"
                  placeholder="Search faculty or docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-input rounded-md bg-background text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
                />
              </div>
              <div className="bg-card text-card-foreground shadow-md rounded-md border p-4">
                <ul className="space-y-3">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <li key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-8 w-20" />
                      </li>
                    ))
                  ) : recentSubmissions.filter(s => (s.file_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || (s.document_type?.toLowerCase() || '').includes(searchQuery.toLowerCase())).length > 0 ? (
                    recentSubmissions
                      .filter(s => (s.file_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || (s.document_type?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
                      .map((sub) => (
                      <li key={sub.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-muted-foreground">
                          {sub.document_type} upload: <span className="font-medium text-foreground">{sub.file_name}</span>
                        </span>
                        <div className="space-x-2">
                          <Button asChild size="sm" variant="outline">
                            <Link to="/admin/approvals">Manage</Link>
                          </Button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-sm text-muted-foreground py-2">No pending submissions.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  <Button
                    asChild
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-950 dark:bg-blue-900/70 dark:text-blue-100 dark:hover:bg-blue-900"
                  >
                    <Link to="/admin/accounts">Add User</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-amber-100 hover:bg-amber-200 text-amber-950 dark:bg-amber-900/70 dark:text-amber-100 dark:hover:bg-amber-900"
                  >
                    <Link to="/admin/approvals">View Approvals</Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full bg-green-100 hover:bg-green-200 text-green-950 dark:bg-green-900/70 dark:text-green-100 dark:hover:bg-green-900"
                  >
                    <Link to="/admin/reports">Generate Report</Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    <Link to="/admin/settings">Settings</Link>
                  </Button>

              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

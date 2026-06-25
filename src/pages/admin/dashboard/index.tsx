import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState, useEffect, useMemo } from "react";
import getFromDatabase from "@/tools/database/getFromDatabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { ClipboardCheck, Download, FileStack, Search, UsersRound, Activity } from "lucide-react";

interface AccountRow extends Record<string, unknown> {
  id: string;
}

interface AuditLogRow extends Record<string, unknown> {
  user_id: string;
  timestamp: string;
}

interface SubmissionRow extends Record<string, unknown> {
  id: string;
  user_id: string;
  document_type?: string;
  file_name?: string;
  status?: string;
  submitted_at?: string;
}

interface UploadTrend {
  name: string;
  date: string;
  uploads: number;
}

interface CategoryDatum {
  name: string;
  value: number;
}

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#ca8a04', '#be123c'];
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
  const [uploadData, setUploadData] = useState<UploadTrend[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDatum[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<SubmissionRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const filteredRecentSubmissions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return recentSubmissions;

    return recentSubmissions.filter((submission) =>
      [submission.file_name, submission.document_type]
        .some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [recentSubmissions, searchQuery]);

  const handleExportCSV = async () => {
    try {
      const submissions = await getFromDatabase<SubmissionRow>({ table: 'submissions', getAll: true, match: {} });
      if (!submissions || submissions.length === 0) return;
      
      const keys = Object.keys(submissions[0]);
      const csv = [
        keys.join(','),
        ...submissions.map((row) => keys.map((key) => `"${String(row[key] ?? '').replace(/"/g, '""')}"`).join(','))
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
        const accounts = await getFromDatabase<AccountRow>({ table: 'account_details', getAll: true, match: {} });
        setUsersCount(accounts.length);

        const submissions = await getFromDatabase<SubmissionRow>({ table: 'submissions', getAll: true, match: {} });
        
        const pending = submissions.filter((submission) => submission.status === "Pending");
        setPendingApprovals(pending.length);
        setRecentSubmissions(pending.slice(0, 5));

        const logs = await getFromDatabase<AuditLogRow>({ table: 'audit_logs', getAll: true, match: { action: 'LOGIN' } });
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeUsers = new Set(
          logs
            .filter((log) => new Date(log.timestamp) > oneDayAgo)
            .map((log) => log.user_id)
        );
        setActiveSessions(activeUsers.size);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const last7Days: UploadTrend[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          last7Days.push({
            name: days[d.getDay()],
            date: d.toISOString().split('T')[0],
            uploads: 0
          });
        }

        submissions.forEach((sub) => {
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
        setUploadData(last7Days);

        const categories: Record<string, number> = {};
        submissions.forEach((sub) => {
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
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reviewer workspace</p>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                  Admin Dashboard
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Monitor browser-local demo submissions, credential mix, and reviewer activity from one place.
                </p>
              </div>
              <Button onClick={handleExportCSV} className="w-full sm:w-auto">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="rounded-lg border-blue-200 bg-blue-50 text-blue-950 shadow-sm dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <UsersRound className="h-4 w-4" />
                    Total Users
                  </CardTitle>
                  <CardDescription className="text-blue-800/80 dark:text-blue-100/75">Seeded and browser-local accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-12" /> : usersCount}</div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border-green-200 bg-green-50 text-green-950 shadow-sm dark:border-green-900/70 dark:bg-green-950/50 dark:text-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4" />
                    Active Sessions (24h)
                  </CardTitle>
                  <CardDescription className="text-green-800/80 dark:text-green-100/75">Recent seeded login activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-12" /> : activeSessions}</div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border-amber-200 bg-amber-50 text-amber-950 shadow-sm dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ClipboardCheck className="h-4 w-4" />
                    Pending Approvals
                  </CardTitle>
                  <CardDescription className="text-amber-800/80 dark:text-amber-100/75">Credentials waiting for review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-12" /> : pendingApprovals}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card className="rounded-lg shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileStack className="h-5 w-5" />
                    Documents Uploaded (Last 7 Days)
                  </CardTitle>
                  <CardDescription>Demo submissions grouped by day</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] text-muted-foreground">
                  {isLoading ? <Skeleton className="w-full h-full" /> : (
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 300 }}>
                      <BarChart data={uploadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
                        <YAxis tick={{ fill: 'currentColor' }} />
                        <RechartsTooltip contentStyle={chartTooltipStyle} labelStyle={{ color: 'var(--popover-foreground)' }} />
                        <Bar dataKey="uploads" fill="#2563eb" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-lg shadow-sm">
                <CardHeader>
                  <CardTitle>Document Categories</CardTitle>
                  <CardDescription>Credential types in the browser-local queue</CardDescription>
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
                          isAnimationActive={false}
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
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Recent Submissions for Approval
                  </h2>
                  <p className="text-sm text-muted-foreground">Search pending demo records before opening Approvals.</p>
                </div>
                <label className="relative block w-full md:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <span className="sr-only">Search submissions</span>
                  <Input
                    type="text"
                    placeholder="Search faculty or docs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </label>
              </div>
              <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <ul className="space-y-3">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <li key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-8 w-20" />
                      </li>
                    ))
                  ) : filteredRecentSubmissions.length > 0 ? (
                    filteredRecentSubmissions.map((sub) => (
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
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
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

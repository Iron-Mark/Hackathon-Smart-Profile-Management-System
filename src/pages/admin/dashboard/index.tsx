import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricStrip } from "@/components/layout/MetricStrip";
import { Section, Surface } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const COLORS = ['var(--info)', 'var(--success)', 'var(--warning)', 'var(--destructive)', 'var(--primary)', 'var(--chart-5)', 'var(--chart-2)', 'var(--chart-4)'];
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

  const metricValue = (value: number) =>
    isLoading ? <Skeleton className="h-8 w-12" /> : value;

  return (
    <PageShell>
      <PageHeader
        kicker="Reviewer workspace"
        title="Admin Dashboard"
        description="Monitor browser-local demo submissions, credential mix, and reviewer activity from one place."
        actions={
          <Button onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <MetricStrip
        items={[
          { label: 'Total Users', value: metricValue(usersCount), hint: 'Seeded and browser-local accounts', icon: UsersRound, tone: 'info' },
          { label: 'Active Sessions (24h)', value: metricValue(activeSessions), hint: 'Recent seeded login activity', icon: Activity, tone: 'success' },
          { label: 'Pending Approvals', value: metricValue(pendingApprovals), hint: 'Credentials waiting for review', icon: ClipboardCheck, tone: 'warning' },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section
          title={
            <span className="inline-flex items-center gap-2">
              <FileStack className="h-5 w-5" />
              Documents Uploaded (Last 7 Days)
            </span>
          }
          description="Demo submissions grouped by day"
        >
          <Surface className="h-[300px] p-4 text-muted-foreground">
            {isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 300 }}>
                <BarChart data={uploadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
                  <YAxis tick={{ fill: 'currentColor' }} />
                  <RechartsTooltip contentStyle={chartTooltipStyle} labelStyle={{ color: 'var(--popover-foreground)' }} />
                  <Bar dataKey="uploads" fill="var(--info)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Surface>
        </Section>

        <Section
          title="Document Categories"
          description="Credential types in the browser-local queue"
        >
          <Surface className="h-[300px] p-4 text-muted-foreground">
            {isLoading ? <Skeleton className="h-full w-full" /> : (
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
                  <Legend
                    formatter={(value) => (
                      <span className="text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Surface>
        </Section>
      </div>

      <Section
        className="mt-8"
        title="Recent Submissions for Approval"
        description="Search pending demo records before opening Approvals."
        actions={
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
        }
      >
        <Surface>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filteredRecentSubmissions.length > 0 ? (
                filteredRecentSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="text-muted-foreground">
                      {sub.document_type} upload:
                    </TableCell>
                    <TableCell className="font-medium">{sub.file_name}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/admin/approvals">Manage</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                    No pending submissions.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Surface>
      </Section>

      <Section className="mt-8" title="Quick Actions">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/accounts">Add User</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/approvals">View Approvals</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/reports">Generate Report</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/settings">Settings</Link>
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}

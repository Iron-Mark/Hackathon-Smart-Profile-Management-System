import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import getFromDatabase from "@/tools/database/getFromDatabase";

interface AuditLog {
  id: string;
  timestamp: string;
  user_email: string;
  action: string;
  details: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emailFilter, setEmailFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    const normalizedEmail = emailFilter.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesEmail =
        !normalizedEmail || log.user_email.toLowerCase().includes(normalizedEmail);
      const matchesAction = actionFilter === "all" || log.action === actionFilter;

      return matchesEmail && matchesAction;
    });
  }, [actionFilter, emailFilter, logs]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await getFromDatabase({
        table: "audit_logs",
        getAll: true,
        match: {},
      });

      // Join with account_details to get emails
      const userIds = Array.from(new Set(data.map((l: any) => l.user_id)));
      const userData = await Promise.all(
        userIds.map((uid) =>
          getFromDatabase({
            table: "account_details",
            column: "email",
            getAll: false,
            match: { id: uid },
          })
        )
      );

      const userMap = userIds.reduce((acc: any, uid, index) => {
        acc[uid as string] = userData[index][0]?.email || "Unknown";
        return acc;
      }, {});

      const enrichedLogs = data.map((l: any) => ({
        ...l,
        user_email: userMap[l.user_id],
      }));

      setLogs(enrichedLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-muted/40 text-foreground p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">System Audit Logs</h1>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter Logs</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Filter by User Email..."
                  className="max-w-xs"
                  value={emailFilter}
                  onChange={(event) => setEmailFilter(event.target.value)}
                />
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Filter by Action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    <SelectItem value="LOGIN">LOGIN</SelectItem>
                    <SelectItem value="PROFILE_UPDATE">
                      PROFILE_UPDATE
                    </SelectItem>
                    <SelectItem value="DOCUMENT_UPLOAD">
                      DOCUMENT_UPLOAD
                    </SelectItem>
                    <SelectItem value="APPROVAL_ACTION">
                      APPROVAL_ACTION
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchLogs}>Refresh</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Log Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell className="py-4"><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell className="py-4"><Skeleton className="h-4 w-40" /></TableCell>
                              <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell className="py-4"><Skeleton className="h-4 w-full" /></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          filteredLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                {new Date(log.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell>{log.user_email}</TableCell>
                              <TableCell className="font-mono text-xs">{log.action}</TableCell>
                              <TableCell className="whitespace-normal">{log.details}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                </div>
                {!isLoading && filteredLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No audit logs found.
                  </p>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

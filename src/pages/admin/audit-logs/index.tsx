import { useEffect, useState } from "react";
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
                />
                <Select>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Filter by Action..." />
                  </SelectTrigger>
                  <SelectContent>
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
                    <table className="w-full text-left table-auto">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2">Timestamp</th>
                          <th className="px-4 py-2">User</th>
                          <th className="px-4 py-2">Action</th>
                          <th className="px-4 py-2">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b">
                              <td className="px-4 py-4"><Skeleton className="h-4 w-32" /></td>
                              <td className="px-4 py-4"><Skeleton className="h-4 w-40" /></td>
                              <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                              <td className="px-4 py-4"><Skeleton className="h-4 w-full" /></td>
                            </tr>
                          ))
                        ) : (
                          logs.map((log) => (
                            <tr key={log.id} className="border-b hover:bg-muted/60">
                              <td className="px-4 py-2 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-4 py-2">{log.user_email}</td>
                              <td className="px-4 py-2 font-mono text-xs">{log.action}</td>
                              <td className="px-4 py-2">{log.details}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                </div>
                {!isLoading && logs.length === 0 && (
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

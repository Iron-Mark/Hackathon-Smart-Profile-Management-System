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

// Mock data for audit logs - replace with actual data fetching and pagination
const mockAuditLogs = [
  {
    id: "log1",
    timestamp: "2025-05-07 10:15:30",
    user: "admin@ccis.edu",
    action: "User Login",
    details: "Admin user logged in from IP 192.168.1.100",
  },
  {
    id: "log2",
    timestamp: "2025-05-07 09:30:00",
    user: "alice@ccis.edu",
    action: "Profile Update",
    details: "Updated 'Publications' section",
  },
  {
    id: "log3",
    timestamp: "2025-05-06 14:22:10",
    user: "admin@ccis.edu",
    action: "Approval Action",
    details: "Approved submission 'sub1' for Dr. Alice Wonderland",
  },
  {
    id: "log4",
    timestamp: "2025-05-05 11:05:00",
    user: "bob@ccis.edu",
    action: "Document Upload",
    details: "Uploaded file 'research_paper_final.pdf'",
  },
];

export default function AdminAuditLogsPage() {
  return (
    <SidebarProvider>
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-gray-50 p-6">
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
                    <SelectItem value="User Login">User Login</SelectItem>
                    <SelectItem value="Profile Update">
                      Profile Update
                    </SelectItem>
                    <SelectItem value="Document Upload">
                      Document Upload
                    </SelectItem>
                    <SelectItem value="Approval Action">
                      Approval Action
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button>Apply Filters</Button>
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
                      {mockAuditLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-100">
                          <td className="px-4 py-2 whitespace-nowrap">
                            {log.timestamp}
                          </td>
                          <td className="px-4 py-2">{log.user}</td>
                          <td className="px-4 py-2">{log.action}</td>
                          <td className="px-4 py-2">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mockAuditLogs.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
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

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component

// Mock data for pending approvals - replace with actual data fetching
const mockApprovals = [
  {
    id: "sub1",
    facultyName: "Dr. Alice Wonderland",
    submissionType: "New Publication",
    dateSubmitted: "2025-05-01",
    status: "Pending",
  },
  {
    id: "sub2",
    facultyName: "Prof. Bob The Builder",
    submissionType: "Updated CV",
    dateSubmitted: "2025-05-03",
    status: "Pending",
  },
  {
    id: "sub3",
    facultyName: "Ms. Carol Danvers",
    submissionType: "Conference Attendance Proof",
    dateSubmitted: "2025-05-05",
    status: "Pending",
  },
];

export default function AdminApprovalsPage() {
  return (
    <SidebarProvider>
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Approval Management</h1>
              {/* Potential filter/sort options could go here */}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pending Faculty Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2">Faculty Name</th>
                      <th className="px-4 py-2">Submission Type</th>
                      <th className="px-4 py-2">Date Submitted</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockApprovals.map((approval) => (
                      <tr
                        key={approval.id}
                        className="border-b hover:bg-gray-100"
                      >
                        <td className="px-4 py-2">{approval.facultyName}</td>
                        <td className="px-4 py-2">{approval.submissionType}</td>
                        <td className="px-4 py-2">{approval.dateSubmitted}</td>
                        <td className="px-4 py-2">
                          <Badge
                            variant={
                              approval.status === "Pending"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {approval.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button variant="outline" size="sm" className="mr-2">
                            View Details
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="mr-2 bg-green-500 hover:bg-green-600 text-white"
                          >
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm">
                            Return
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mockApprovals.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No pending approvals.
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

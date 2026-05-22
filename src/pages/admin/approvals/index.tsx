import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import getFromDatabase from "@/tools/database/getFromDatabase";
import updateDatabase from "@/tools/database/updateDatabase";
import getFileFromFolder from "@/tools/buckets/getFileFromFolder";
import { logAudit } from "@/tools/database/logAudit";
import { toast, Toaster } from "sonner";

interface Submission {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  status: string;
  submitted_at: string;
  facultyName?: string;
}

export default function AdminApprovalsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const data = await getFromDatabase({
        table: "submissions",
        getAll: true,
        match: {},
      });

      // Fetch faculty names for these submissions
      const userIds = Array.from(new Set(data.map((s: any) => s.user_id)));
      const facultyData = await Promise.all(
        userIds.map((uid) =>
          getFromDatabase({
            table: "account_details",
            column: "name",
            getAll: false,
            match: { id: uid },
          })
        )
      );

      const userMap = userIds.reduce((acc: any, uid, index) => {
        acc[uid as string] = facultyData[index][0]?.name || "Unknown Faculty";
        return acc;
      }, {});

      const enrichedSubmissions = data.map((s: any) => ({
        ...s,
        facultyName: userMap[s.user_id],
      }));

      setSubmissions(enrichedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleAction = async (id: string, newStatus: string) => {
    try {
      await updateDatabase({
        table: "submissions",
        data: { status: newStatus },
        match: { id },
      });
      await logAudit('APPROVAL_ACTION', `Admin ${newStatus.toLowerCase()} submission ${id}`);
      toast.success(`Submission ${newStatus.toLowerCase()} successfully`);
      fetchSubmissions();
    } catch (error) {
      toast.error(`Failed to ${newStatus.toLowerCase()} submission`);
    }
  };

  return (
    <SidebarProvider>
      <Toaster position="top-right" />
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Approval Management</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Faculty Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-4">Loading submissions...</p>
                ) : (
                  <table className="w-full text-left table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2">Faculty Name</th>
                        <th className="px-4 py-2">Document Type</th>
                        <th className="px-4 py-2">File Name</th>
                        <th className="px-4 py-2">Date Submitted</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr
                          key={submission.id}
                          className="border-b hover:bg-gray-100"
                        >
                          <td className="px-4 py-2">{submission.facultyName}</td>
                          <td className="px-4 py-2">{submission.document_type}</td>
                          <td className="px-4 py-2">{submission.file_name}</td>
                          <td className="px-4 py-2">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={
                                submission.status === "Pending"
                                  ? "secondary"
                                  : submission.status === "Approved"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {submission.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-right">
                            {submission.status === "Pending" && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="mr-2 bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => handleAction(submission.id, "Approved")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleAction(submission.id, "Returned")}
                                >
                                  Return
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-2"
                              onClick={async () => {
                                const url = await getFileFromFolder({
                                  bucketName: 'pictures-and-documents',
                                  fileName: submission.file_name,
                                  type: submission.document_type,
                                  userId: submission.user_id,
                                });
                                if (url) window.open(url, '_blank');
                                else toast.error('Could not retrieve file URL');
                              }}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {!isLoading && submissions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No submissions found.
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

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
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

      setSubmissions(enrichedSubmissions.sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()));
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
          <main className="flex-1 w-full bg-muted/40 text-foreground p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Approval Management</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Faculty Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty Name</TableHead>
                        <TableHead>Document Type</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Date Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                         Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="py-4"><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell className="py-4 text-right">
                              <Skeleton className="ml-auto h-8 w-24" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        submissions.map((submission) => (
                          <TableRow
                            key={submission.id}
                          >
                            <TableCell>{submission.facultyName}</TableCell>
                            <TableCell>{submission.document_type}</TableCell>
                            <TableCell>{submission.file_name}</TableCell>
                            <TableCell>
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell className="text-right">
                              {submission.status === "Pending" && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="mr-2 bg-green-700 hover:bg-green-800 text-white dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400"
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
                                  if (url) window.open(url, '_blank', 'noopener,noreferrer');
                                  else toast.error('Could not retrieve file URL');
                                }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                {!isLoading && submissions.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
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

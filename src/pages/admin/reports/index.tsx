import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import getFromDatabase from "@/tools/database/getFromDatabase";
import { filterRowsByDateRange, type DateRangeFilter } from "@/lib/reportExport";
import Papa from 'papaparse';
import { toast, Toaster } from "sonner";

// Report types
const reportTypes = [
  { value: "faculty_list", label: "Faculty List & Roles", table: "account_details" },
  { value: "submissions_report", label: "Submissions Summary", table: "submissions" },
  { value: "audit_report", label: "System Audit Trail", table: "audit_logs" },
  { value: "profile_data", label: "Faculty Professional Details", table: "profile_details" },
];

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRangeFilter | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast.error("Please select a report type");
      return;
    }

    const reportConfig = reportTypes.find(r => r.value === selectedReport);
    if (!reportConfig) return;

    try {
      setIsGenerating(true);
      const data = await getFromDatabase({
        table: reportConfig.table,
        getAll: true,
        match: {},
      });

      if (!data || data.length === 0) {
        toast.info("No data found for this report");
        return;
      }

      const filteredData = filterRowsByDateRange(data, dateRange);

      if (filteredData.length === 0) {
        toast.info("No rows matched the selected date range");
        return;
      }

      const csv = Papa.unparse(filteredData);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report generated and downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
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
              <h1 className="text-3xl font-bold">Reports and Analytics</h1>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Generate New Report (CSV)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="reportType"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Select Report Type
                  </label>
                  <Select onValueChange={setSelectedReport} value={selectedReport}>
                    <SelectTrigger id="reportType">
                      <SelectValue placeholder="Choose a report..." />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((report) => (
                        <SelectItem key={report.value} value={report.value}>
                          {report.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="dateRange"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Date Range (Optional)
                    </label>
                    <DatePickerWithRange
                      onDateChange={setDateRange}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  className="w-full md:w-auto"
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate & Download CSV"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-4">
                  Data visualization modules are integrated with Recharts in the Dashboard.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

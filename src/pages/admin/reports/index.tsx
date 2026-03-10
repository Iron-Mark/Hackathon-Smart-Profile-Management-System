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
import { DatePickerWithRange } from "@/components/ui/date-picker"; // Corrected import

// Mock data for report types - replace or augment with dynamic data
const reportTypes = [
  { value: "ched_compliance", label: "CHED Compliance Report" },
  { value: "faculty_activity", label: "Faculty Activity Summary" },
  { value: "publication_list", label: "Faculty Publication List" },
  { value: "research_overview", label: "Research Overview" },
  { value: "training_seminars", label: "Training & Seminars Attended" },
];

export default function AdminReportsPage() {
  // State for selected report type and date range (optional)
  // const [selectedReport, setSelectedReport] = React.useState<string | undefined>();
  // const [dateFrom, setDateFrom] = React.useState<Date | undefined>();
  // const [dateTo, setDateTo] = React.useState<Date | undefined>();

  const handleGenerateReport = () => {
    // Logic to generate report based on selectedReport, dateFrom, dateTo
    // This would typically involve API calls and data processing
    alert("Generating report... (placeholder)");
  };

  return (
    <SidebarProvider>
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Reports and Analytics</h1>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Generate New Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="reportType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Report Type
                  </label>
                  <Select /* onValueChange={setSelectedReport} value={selectedReport} */
                  >
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
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Date Range (Optional)
                    </label>
                    <DatePickerWithRange
                      onDateChange={(range) => {
                        console.log("Selected date range:", range);
                      }}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  className="w-full md:w-auto"
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recently Generated Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for a list of previously generated reports */}
                <p className="text-center text-gray-500 py-4">
                  No reports generated yet.
                </p>
                {/* Example of a report list item:
                <div className="border-b py-2 flex justify-between items-center">
                  <span>CHED Compliance Report - 2025-04-30</span>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                */}
              </CardContent>
            </Card>

            {/* Placeholder for Analytics Section */}
            {/* <Card className="mt-6">
              <CardHeader><CardTitle>Faculty Data Analytics</CardTitle></CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-4">Analytics dashboard coming soon.</p>
              </CardContent>
            </Card> */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Surface } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

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
    <PageShell>
      <PageHeader
        kicker="Reviewer workspace"
        title="Reports and Analytics"
        description="Export browser-local demo tables as CSV for review."
      />

      <Section title="Generate New Report (CSV)">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="reportType"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Select Report Type
            </label>
            <Select onValueChange={setSelectedReport} value={selectedReport}>
              <SelectTrigger id="reportType" className="max-w-md">
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

          <div>
            <label
              htmlFor="dateRange"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Date Range (Optional)
            </label>
            <DatePickerWithRange
              onDateChange={setDateRange}
            />
          </div>

          <Button
            onClick={handleGenerateReport}
            className="w-full md:w-auto"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate & Download CSV"}
          </Button>
        </div>
      </Section>

      <Section className="mt-10" title="Analytics Insights">
        <Surface className="px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Data visualization modules are integrated with Recharts in the Dashboard.
          </p>
        </Surface>
      </Section>
    </PageShell>
  );
}

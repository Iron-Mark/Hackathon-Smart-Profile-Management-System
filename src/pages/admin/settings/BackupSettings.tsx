import { useState } from "react";
import { Notice } from "@/components/layout/Notice";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Download, Database, ShieldAlert } from "lucide-react";
import getFromDatabase from "@/tools/database/getFromDatabase";
import { toast } from "sonner";
import { logAudit } from "@/tools/database/logAudit";

export default function BackupSettings() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      const tables = [
        "account_details",
        "profile_details",
        "submissions",
        "educational_background",
        "work_experiences",
        "professional_development",
        "audit_logs"
      ];

      const backupData: Record<string, unknown> = {};

      for (const table of tables) {
        const data = await getFromDatabase({ table, getAll: true, match: {} });
        backupData[table] = data;
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ccis_fpms_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await logAudit('SETTINGS_CHANGE', 'Admin exported a full system backup');
      toast.success("System backup exported successfully");
    } catch (error) {
      console.error("Backup failed:", error);
      toast.error("Failed to export backup");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Section
      title={
        <span className="inline-flex items-center gap-2">
          <Database className="h-5 w-5" /> Backup & Data Management
        </span>
      }
    >
      <Notice tone="warning" icon={ShieldAlert} title="Warning">
        Backups contain sensitive faculty information including personal details and document records. Ensure all exported data is stored securely.
      </Notice>

      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Full System Export</p>
            <p className="text-sm text-muted-foreground">Download all database tables as a single JSON file.</p>
          </div>
          <Button onClick={handleExportAll} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export JSON"}
          </Button>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Reset-Safe Local Backup</p>
            <p className="text-sm text-muted-foreground">Export browser-local demo data before resetting the showcase.</p>
          </div>
          <Button onClick={handleExportAll} disabled={isExporting} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Backup"}
          </Button>
        </div>
      </div>
    </Section>
  );
}

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

      const backupData: any = {};
      
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" /> Backup & Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-1">Warning</p>
            Backups contain sensitive faculty information including personal details and document records. Ensure all exported data is stored securely.
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Full System Export</p>
              <p className="text-sm text-gray-500">Download all database tables as a single JSON file.</p>
            </div>
            <Button onClick={handleExportAll} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export JSON"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
            <div>
              <p className="font-medium">Automatic Cloud Backup</p>
              <p className="text-sm text-gray-500">Scheduled weekly backups to Supabase Storage.</p>
            </div>
            <Button disabled variant="outline">Coming Soon</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

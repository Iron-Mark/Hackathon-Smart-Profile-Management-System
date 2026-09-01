import { useEffect, useState } from "react";
import { Section } from "@/components/layout/Section";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { logAudit } from "@/tools/database/logAudit";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    submissionNotif: true,
    approvalNotif: true,
    reminderNotif: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("admin_notification_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => async (checked: boolean) => {
    const newSettings = { ...settings, [key]: checked };
    setSettings(newSettings);
    localStorage.setItem("admin_notification_settings", JSON.stringify(newSettings));

    toast.success(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${checked ? 'enabled' : 'disabled'}`);
    await logAudit('SETTINGS_CHANGE', `Admin ${checked ? 'enabled' : 'disabled'} ${key} notifications`);
  };

  return (
    <Section
      title="Notification Settings"
      description="Configure system-wide notification preferences."
    >
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <Label htmlFor="submission-notif" className="flex-1 cursor-pointer">
            Faculty Submission Notifications
            <p className="text-xs font-normal text-muted-foreground">Get notified when a faculty member uploads a new document.</p>
          </Label>
          <Switch
            id="submission-notif"
            checked={settings.submissionNotif}
            onCheckedChange={handleToggle('submissionNotif')}
          />
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <Label htmlFor="approval-notif" className="flex-1 cursor-pointer">
            Approval Status Notifications
            <p className="text-xs font-normal text-muted-foreground">Notify faculty when their documents are approved or returned.</p>
          </Label>
          <Switch
            id="approval-notif"
            checked={settings.approvalNotif}
            onCheckedChange={handleToggle('approvalNotif')}
          />
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <Label htmlFor="reminder-notif" className="flex-1 cursor-pointer">
            Reminder Notifications
            <p className="text-xs font-normal text-muted-foreground">Automated reminders for license expiry and missing documents.</p>
          </Label>
          <Switch
            id="reminder-notif"
            checked={settings.reminderNotif}
            onCheckedChange={handleToggle('reminderNotif')}
          />
        </div>
      </div>
    </Section>
  );
}

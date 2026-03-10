import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Configure system-wide notification preferences.</p>
        <div className="flex items-center justify-between">
          <Label htmlFor="submission-notif">
            Faculty Submission Notifications
          </Label>
          <Switch id="submission-notif" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="approval-notif">Approval Status Notifications</Label>
          <Switch id="approval-notif" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder-notif">
            Reminder Notifications (e.g., license expiry)
          </Label>
          <Switch id="reminder-notif" />
        </div>
        {/* Placeholder for more notification options */}
      </CardContent>
    </Card>
  );
}

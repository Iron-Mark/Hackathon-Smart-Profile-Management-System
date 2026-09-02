import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackupSettings from "./BackupSettings";
import FormSettings from "./FormSettings";
import NotificationSettings from "./NotificationSettings";

export default function AdminSettingsPage() {
  return (
    <PageShell>
      <PageHeader
        kicker="Reviewer workspace"
        title="System Settings"
        description="Notification, form, and backup controls for this browser-local demo."
      />
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="backup">Backup & Data</TabsTrigger>
        </TabsList>
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="forms">
          <FormSettings />
        </TabsContent>
        <TabsContent value="backup">
          <BackupSettings />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

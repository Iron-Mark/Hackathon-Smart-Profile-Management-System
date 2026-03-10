import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackupSettings from "./BackupSettings";
import FormSettings from "./FormSettings";
import NotificationSettings from "./NotificationSettings";

export default function AdminSettingsPage() {
  return (
    <SidebarProvider>
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-gray-50 p-6">
            <h1 className="text-3xl font-bold mb-6">System Settings</h1>
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

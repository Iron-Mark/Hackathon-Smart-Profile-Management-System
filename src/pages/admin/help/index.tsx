import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AdminHelpPage() {
  return (
    <SidebarProvider>
      <div className="flex w-screen min-h-screen">
        <AppSidebar className="hidden md:block" />
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 w-full bg-muted/40 text-foreground p-6">
            <h1 className="text-3xl font-bold mb-6">Help & Support</h1>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Account Management</AccordionTrigger>
                <AccordionContent>
                  Detailed instructions on how to create, update, and manage
                  faculty accounts. Information on role-based access control.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Approval Workflow</AccordionTrigger>
                <AccordionContent>
                  How to review and approve faculty submissions. Understanding
                  the notification system for pending approvals.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Reports and Analytics</AccordionTrigger>
                <AccordionContent>
                  Guide to generating CHED compliance reports and other
                  institutional reports. How to use the analytics dashboard.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Audit Logs</AccordionTrigger>
                <AccordionContent>
                  Understanding how to view and interpret audit logs for system
                  actions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>System Settings</AccordionTrigger>
                <AccordionContent>
                  Information on configuring backup settings, customizing forms,
                  and managing notification preferences.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-8 p-4 border rounded-md bg-blue-50 text-blue-950 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-900/70">
              <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
              <p>
                If you encounter any issues or have questions not covered in
                this guide, please contact the IT support team at{" "}
                <a
                  href="mailto:support@ccis.edu"
                  className="text-blue-700 hover:underline dark:text-blue-300"
                >
                  support@ccis.edu
                </a>
                .
              </p>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

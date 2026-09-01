import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Notice } from "@/components/layout/Notice";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AdminHelpPage() {
  return (
    <PageShell>
      <PageHeader
        kicker="Reviewer workspace"
        title="Help & Support"
        description="Short guides for the browser-local admin review workflow."
      />

      <Accordion type="single" collapsible className="w-full rounded-lg border border-border px-4">
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

      <Notice tone="info" className="mt-8" title="Contact Support">
        <p>
          If you encounter any issues or have questions not covered in
          this guide, please contact the IT support team at{" "}
          <a
            href="mailto:support@ccis.edu"
            className="underline-offset-4 hover:underline"
          >
            support@ccis.edu
          </a>
          .
        </p>
      </Notice>
    </PageShell>
  );
}

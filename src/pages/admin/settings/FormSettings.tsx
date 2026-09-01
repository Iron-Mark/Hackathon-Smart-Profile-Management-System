import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/layout/Notice";
import { Section } from "@/components/layout/Section";
import { categoryIcons } from "@/lib/icons";
import { Info } from "lucide-react";

export default function FormSettings() {
  const categories = Object.keys(categoryIcons);

  return (
    <Section
      title="Form & Category Configuration"
      description="These categories are used by the AI to classify uploaded documents."
    >
      <Notice tone="info" icon={Info}>
        The following document categories are currently active in the system. These categories are used by the AI to classify uploaded documents.
      </Notice>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Active Document Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="flex items-center gap-2 px-3 py-1 text-sm">
              {categoryIcons[cat as keyof typeof categoryIcons]?.icon}
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 text-foreground">
        <h3 className="mb-2 text-sm font-semibold">Submission Rules</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>OCR text extraction is mandatory for all image uploads.</li>
          <li>AI classification uses the optional configured AI service or deterministic demo fallbacks.</li>
          <li>Administrators must review all "Pending" submissions.</li>
        </ul>
      </div>
    </Section>
  );
}

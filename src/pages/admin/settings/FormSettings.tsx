import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryIcons } from "@/lib/icons";
import { Info } from "lucide-react";

export default function FormSettings() {
  const categories = Object.keys(categoryIcons);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form & Category Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-900 rounded-md border border-blue-200 text-sm dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-900/70">
          <span className="shrink-0"><Info className="w-5 h-5" /></span>
          <p>
            The following document categories are currently active in the system. These categories are used by the AI to classify uploaded documents.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Active Document Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-2">
                {categoryIcons[cat as keyof typeof categoryIcons]?.icon}
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t text-foreground">
          <h3 className="text-sm font-semibold mb-2">Submission Rules</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>OCR text extraction is mandatory for all image uploads.</li>
            <li>AI classification is powered by GPT-3.5 and Tesseract.js.</li>
            <li>Administrators must review all "Pending" submissions.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

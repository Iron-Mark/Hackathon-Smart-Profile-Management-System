import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FormSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customizable Forms</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Manage and customize forms used for faculty submissions.
        </p>
        {/* Placeholder for form customization options */}
        <Button>Customize Forms</Button>
      </CardContent>
    </Card>
  );
}

// src/components/faculty/PersonalInfoForm.tsx
import { useState, type FormEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PersonalInfo } from "@/hooks/use-personalInfo";
import updateDatabase from "@/tools/database/updateDatabase";      
import { logAudit } from "@/tools/database/logAudit";
import { useFetchUserId } from "@/hooks/use-userId";
export interface PersonalInfoFormProps {
  initialValues?: PersonalInfo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PersonalInfoForm({
  initialValues,
  onSuccess,
  onCancel,
}: PersonalInfoFormProps) {
  const [form, setForm] = useState<PersonalInfo>({
    name: initialValues?.name ?? "",
    email: initialValues?.email ?? "",
    profession: initialValues?.profession ?? "",
    description: initialValues?.description ?? "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { userId, error: userIdError } = useFetchUserId();

  const handleChange =
    (field: keyof PersonalInfo) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f: PersonalInfo) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!userId) {
        throw new Error(userIdError || "User not authenticated");
      }

      // Update account_details (name)
      await updateDatabase({
        table: "account_details",
        data: { name: form.name },
        match: { id: userId },
      });

      // Update profile_details (profession, description)
      await updateDatabase({
        table: "profile_details",
        data: { 
          profession: form.profession,
          description: form.description
        },
        match: { id: userId },
      });

      await logAudit('PROFILE_UPDATE', `User updated personal information`, userId);

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-red-800 bg-red-100 p-2 rounded text-sm dark:bg-red-950/60 dark:text-red-200">{error}</p>
      )}

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            required
            className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Email (Read-only)</label>
          <input
            type="email"
            value={form.email}
            disabled
            className="mt-1 block w-full rounded-md border border-border bg-muted px-3 py-2 text-muted-foreground shadow-sm cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Profession</label>
          <input
            type="text"
            value={form.profession}
            onChange={handleChange("profession")}
            className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Profile Description
          </label>
          <textarea
            value={form.description}
            onChange={handleChange("description")}
            rows={4}
            className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <Separator />

      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

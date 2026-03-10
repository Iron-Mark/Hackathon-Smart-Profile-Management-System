// src/components/faculty/PersonalInfoForm.tsx
import { useState, type FormEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PersonalInfo } from "@/hooks/use-personalInfo";

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

  const handleChange =
    (field: keyof PersonalInfo) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f: PersonalInfo) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/faculty/profile", {
        method: initialValues ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
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
        <p className="text-red-600 bg-red-100 p-2 rounded text-sm">{error}</p>
      )}

      <div className="grid gap-4">
        {(["name", "email", "profession"] as (keyof PersonalInfo)[]).map(
          (field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {field.replace("-", " ")}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={handleChange(field)}
                required={field !== "profession"}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Profile Description
          </label>
          <textarea
            value={form.description}
            onChange={handleChange("description")}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

import supabase from "@/client/supabase";
import { useUserId } from "@/hooks/use-userId";

type UploadedFile = {
  id: number;
  name: string;
  uploadedAt: string;
  status: string;
  category: string;
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

async function fetchUploadedFiles(): Promise<UploadedFile[] | null> {
  const { userId, success } = await useUserId(); // Your dynamic userId logic
  if (!userId || !success) {
    return null;
  }

  const categories = [
    "Certificates",
    "PRC License",
    "Valid ID",
    "Resume",
    "Transcript of records",
    "Research Publications",
    "Diplomas",
    "Curriculum Vitae",
  ] as const;
  let allFiles: UploadedFile[] = [];
  let currentId = 1;

  for (const category of categories) {
    const { data, error } = await supabase.storage
      .from("pictures-and-documents")
      .list(`${userId}/${category}`);

    if (error) {
      console.error(`Error fetching ${category}:`, error);
      continue;
    }

    const files = data.map((file) => ({
      id: currentId++,
      name: file.name,
      uploadedAt: formatDate(file.updated_at) || new Date().toISOString(),
      status: "Unverified", // Default since storage has no status
      category,
    }));

    allFiles = allFiles.concat(files);
  }

  return allFiles;
}

export default fetchUploadedFiles;

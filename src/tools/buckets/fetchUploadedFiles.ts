import supabase from "@/client/supabase";

import getFromDatabase from "../database/getFromDatabase";

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

async function fetchUploadedFiles(userId: string): Promise<UploadedFile[] | null> {
  if (!userId) {
    return null;
  }

  // Fetch submissions to get statuses
  const submissions = await getFromDatabase({
    table: "submissions",
    getAll: true,
    match: { user_id: userId }
  });

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

    const files = data.map((file) => {
      // Find matching submission to get status
      const submission = submissions.find(
        (s: { file_name: string; document_type: string; status: string }) => s.file_name === file.name && s.document_type === category
      );
      
      return {
        id: currentId++,
        name: file.name,
        uploadedAt: formatDate(file.updated_at ?? new Date().toISOString()),
        status: submission?.status || "Unverified",
        category,
      };
    });

    allFiles = allFiles.concat(files);
  }

  return allFiles;
}

export default fetchUploadedFiles;

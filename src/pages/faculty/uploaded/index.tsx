import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Notice } from "@/components/layout/Notice";
import { Surface } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState, useEffect, type ReactElement } from "react";
import { Filter as FilterIcon, UploadCloud, EyeIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils'
import { categoryIcons, statusVariants, type Category } from '@/lib/icons'
import removeItemFromBucket from '@/tools/buckets/removeItemFromBucket'
import { useFetchUserId } from '@/hooks/use-userId'
import { toast } from 'sonner'
import moveFile from '@/tools/buckets/moveFile'
import extractTextFromImage from '@/tools/ocr/extractTextFromImage'
import getFileFromFolder from '@/tools/buckets/getFileFromFolder'
import { analyzeDocument } from '@/tools/ai/analyzeDocument'
import uploadToUserFolder from '@/tools/buckets/uploadToUserFolder'
import insertToDatabase from '@/tools/database/insertToDatabase'
import getFromDatabase from '@/tools/database/getFromDatabase'
import removeFromDatabase from '@/tools/database/removeFromDatabase'
import updateDatabase from '@/tools/database/updateDatabase'
import backend from '@/client/backend'

type UploadedFile = {
  id: string;
  submissionId: string;
  name: string;
  uploadedAt: string;
  status: string;
  category: string;
};

export default function UploadedFilesPage() {
  const [filter, setFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [editableFiles, setEditableFiles] = useState<UploadedFile[] | null>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const { userId, error } = useFetchUserId();

  const prepareFiles = async () => {
    setIsLoading(true);
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const submissions = await getFromDatabase({
        table: "submissions",
        getAll: true,
        match: { user_id: userId }
      });

      const files = submissions.map((s: { file_name: string; created_at: string; status: string; document_type: string; id: string }) => ({
        id: s.id,
        submissionId: s.id,
        name: s.file_name,
        uploadedAt: s.created_at ? new Date(s.created_at).toLocaleString() : 'N/A',
        status: s.status,
        category: s.document_type,
      }));
      setEditableFiles(files);
    } catch (err) {
      console.error("Failed to fetch files", err);
      toast.error("Failed to fetch uploaded files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setExtractedText(null);
    try {
      const text = await extractTextFromImage(file);
      setExtractedText(text);
      toast.success("Text extracted successfully.");

      toast.info("Analyzing document with AI...");
      const category = await analyzeDocument(text, "Categorize this document into exactly one of: Certificates, PRC License, Valid ID, Resume, Transcript of records, Research Publications, Diplomas, Curriculum Vitae. Return ONLY the exact category string.");

      await uploadToUserFolder({ bucketName: 'pictures-and-documents', file, type: category, filename: file.name, userId: userId || '' });
      await insertToDatabase({ table: "submissions", data: { user_id: userId, document_type: category, file_name: file.name, status: "Pending" } });

      await prepareFiles();
    } catch (error) {
      console.error(error);
      toast.error("Failed to process the document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    id: string,
    field: keyof UploadedFile,
    value: string
  ) => {
    setEditableFiles((prevFiles) =>
      prevFiles
        ? prevFiles.map((file) =>
            file.id === id ? { ...file, [field]: value } : file
          )
        : []
    );
  };

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (userId) {
      prepareFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = backend
      .channel('public:submissions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions',
          filter: `user_id=eq.${userId}`
        },
        (payload: { new: { user_id: string; file_name: string; status: string } }) => {
          if (payload.new && payload.new.user_id === userId) {
            toast.info(`Document ${payload.new.file_name} status updated to ${payload.new.status}`);
            prepareFiles();
          }
        }
      )
      .subscribe();

    return () => {
      backend.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!editableFiles) {
    return null;
  }

  const filteredFiles = editableFiles.filter(
    (file) =>
      (filter === "All" || file.category === filter) &&
      (statusFilter === "All" || file.status === statusFilter)
  );

  const categories: {
    label: string;
    icon: ReactElement | null;
    count: number;
  }[] = [
    { label: "All", icon: null, count: editableFiles.length },
    ...Object.keys(categoryIcons).map((key) => ({
      label: key,
      icon: categoryIcons[key as Category].icon,
      count: editableFiles.filter((file) => file.category === key).length,
    })),
  ];

  const statuses: { label: string; count: number }[] = [
    { label: "All", count: editableFiles.length },
    ...Object.keys(statusVariants).map((key) => ({
      label: key,
      count: editableFiles.filter((file) => file.status === key).length,
    })),
  ];

  return (
    <PageShell>
      <PageHeader
        kicker="Faculty workspace"
        title={`Uploaded Files (${filteredFiles.length})`}
        description="Review, recategorize, or remove credentials stored in this browser-local demo."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FilterIcon className="h-4 w-4" />
                Filter: {filter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.map(({ label, icon, count }) => (
                <DropdownMenuItem
                  key={label}
                  onClick={() => setFilter(label)}
                  className={cn(
                    "flex items-center gap-2",
                    count === 0 ? "bg-muted text-muted-foreground cursor-not-allowed" : ""
                  )}
                  disabled={count === 0}
                >
                  {icon}
                  {label} ({count})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {statuses
          .filter((status) => status.count > 0)
          .map((status) => (
            <Badge
              key={status.label}
              variant="outline"
              className={cn(
                "cursor-pointer flex items-center gap-2 px-3 py-1 rounded-full transition-colors whitespace-nowrap",
                statusFilter === status.label
                  ? status.label === "Verified"
                    ? "bg-success/15 text-success"
                    : status.label === "Pending"
                    ? "bg-info/15 text-info"
                    : status.label === "Not Approved"
                    ? "bg-destructive/15 text-destructive"
                    : ""
                  : "hover:bg-muted"
              )}
              onClick={() => setStatusFilter(status.label)}
            >
              {statusVariants[status.label as keyof typeof statusVariants]?.icon}
              {status.label} ({status.count})
            </Badge>
          ))}
      </div>

      <label
        htmlFor="file-upload"
        className="mb-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-4 py-6 text-center transition-colors hover:bg-muted/40"
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) {
            await handleFileUpload(file);
          }
        }}
      >
        <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Drag and drop an image here</p>
        <p className="text-xs text-muted-foreground">or click to select a file</p>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="file-upload"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              await handleFileUpload(file);
            }
          }}
        />
        <span className="mt-3 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Select File
        </span>
      </label>

      {isUploading && (
        <Notice tone="info" className="mb-6 animate-pulse">
          Extracting text from image... Please wait.
        </Notice>
      )}

      {extractedText && (
        <Notice tone="success" className="mb-6" title="Extracted Text:">
          <div className="mt-2 flex items-start justify-between gap-3">
            <p className="max-h-60 overflow-y-auto whitespace-pre-wrap text-sm">{extractedText}</p>
            <Button variant="outline" size="sm" onClick={() => setExtractedText(null)}>Clear</Button>
          </div>
        </Notice>
      )}

      <Surface>
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-32" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No files match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="max-w-[220px] truncate font-medium">{file.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        {categoryIcons[file.category as keyof typeof categoryIcons]?.icon}
                        {file.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5",
                          statusVariants[file.status as keyof typeof statusVariants]?.color
                        )}
                      >
                        {statusVariants[file.status as keyof typeof statusVariants]?.icon}
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            statusVariants[file.status as keyof typeof statusVariants]?.color
                          )}
                        >
                          {file.status}
                        </Badge>
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{file.uploadedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="cursor-pointer"
                          onClick={async () => {
                            const url = await getFileFromFolder({
                              bucketName: 'pictures-and-documents',
                              fileName: file.name,
                              type: file.category,
                              userId: userId || "",
                            });
                            if (url) window.open(url, '_blank', 'noopener,noreferrer');
                            else toast.error('Could not retrieve file URL');
                          }}
                        >
                          <EyeIcon className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => setSelectedFile(file)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer"
                          onClick={async () => {
                            try {
                              const removed = await removeItemFromBucket({
                                bucketName: "pictures-and-documents",
                                filename: file.name,
                                type: file.category,
                                userId: userId || "",
                              });

                              if (!removed) {
                                toast.error("Could not remove file from demo storage.");
                                return;
                              }

                              await removeFromDatabase({
                                table: "submissions",
                                match: { id: file.submissionId },
                              });

                              setEditableFiles((prevFiles) =>
                                prevFiles
                                  ? prevFiles.filter((prevFile) => prevFile.id !== file.id)
                                  : []
                              );
                              toast.success("File removed successfully.");
                            } catch (error) {
                              console.error("File removal failed", error);
                              toast.error("Could not remove file.");
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Surface>

      <Dialog open={Boolean(selectedFile)} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File</DialogTitle>
            <DialogDescription>
              Review the selected upload and move it to a different document category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                File Name
              </label>
              <Input
                value={selectedFile?.name || ""}
                onChange={(e) =>
                  selectedFile &&
                  handleInputChange(
                    selectedFile.id,
                    "name",
                    e.target.value
                  )
                }
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Category
              </label>
              <Select
                value={selectedFile?.category || ""}
                onValueChange={async (newCategory) => {
                  if (selectedFile) {
                    try {
                      const previousCategory = selectedFile.category;
                      if (newCategory === previousCategory) return;

                      const moved = await moveFile({
                        bucketName: "pictures-and-documents",
                        oldType: previousCategory,
                        newType: newCategory,
                        filename: selectedFile.name,
                        userId: userId || "",
                      });

                      if (!moved) {
                        toast.error("Could not move file to the selected category.");
                        return;
                      }

                      await updateDatabase({
                        table: "submissions",
                        data: {
                          document_type: newCategory,
                          status: "Pending",
                        },
                        match: { id: selectedFile.submissionId },
                      });

                      setSelectedFile((prevFile) =>
                        prevFile
                          ? {
                              ...prevFile,
                              category: newCategory,
                              status: "Pending",
                            }
                          : null
                      );
                      handleInputChange(
                        selectedFile.id,
                        "category",
                        newCategory
                      );
                      handleInputChange(
                        selectedFile.id,
                        "status",
                        "Pending"
                      );
                      toast.success("File moved successfully.");
                    } catch (error) {
                      console.error("File category update failed", error);
                      toast.error("Could not update file category.");
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <div className="flex items-center cursor-pointer">
                    {(selectedFile &&
                      categoryIcons[
                        selectedFile.category as keyof typeof categoryIcons
                      ]?.icon) ||
                      null}{" "}
                    {selectedFile?.category || ""}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c.label !== "All")
                    .map((c) => (
                      <SelectItem
                        key={c.label}
                        value={c.label}
                        className="cursor-pointer flex items-center"
                      >
                        {
                          categoryIcons[
                            c.label as keyof typeof categoryIcons
                          ]?.icon
                        }{" "}
                        {c.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

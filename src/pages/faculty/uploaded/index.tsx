import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Filter as FilterIcon, UploadCloud, EyeIcon } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
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
    icon: React.ReactElement | null;
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
    <SidebarProvider>
      <div className="flex w-screen">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-auto">
          <div className="md:hidden p-4">
            <SidebarTrigger />
          </div>

          <main className="flex-1 w-full p-6 bg-muted/40 text-foreground">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-extrabold text-foreground">
                Uploaded Files ({filteredFiles.length})
              </h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-lg py-2 px-4">
                    <FilterIcon className="w-5 h-5 mr-2" />
                    Filter: {filter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {categories.map(({ label, icon, count }) => (
                    <DropdownMenuItem
                      key={label}
                      onClick={() => setFilter(label)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-md transition-colors",
                        count === 0
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : ""
                      )}
                      disabled={count === 0}
                    >
                      {icon}
                      {label} ({count})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto">
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
                          ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-200"
                          : status.label === "Pending"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
                          : status.label === "Not Approved"
                          ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200"
                          : ""
                        : "hover:bg-muted"
                    )}
                    onClick={() => setStatusFilter(status.label)}
                  >
                    {
                      statusVariants[
                        status.label as keyof typeof statusVariants
                      ]?.icon
                    }
                    {status.label} ({status.count})
                  </Badge>
                ))}
            </div>

            {/* Drag and Drop Zone */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 mb-6 flex flex-col items-center justify-center bg-card hover:bg-muted/60 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  await handleFileUpload(file);
                }
              }}
            >
              <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Drag and drop an image here</p>
              <p className="text-sm text-muted-foreground">or click to select a file</p>
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
              <label
                htmlFor="file-upload"
                className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-md cursor-pointer hover:bg-blue-800 transition-colors dark:bg-blue-500 dark:text-blue-950 dark:hover:bg-blue-400"
              >
                Select File
              </label>
            </div>

            {isUploading && (
              <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg animate-pulse dark:bg-blue-950/60 dark:text-blue-200">
                Extracting text from image... Please wait.
              </div>
            )}

            {extractedText && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950/50 dark:border-green-900/70">
                <h3 className="font-semibold text-green-900 mb-2 flex justify-between items-center dark:text-green-200">
                  Extracted Text:
                  <Button variant="outline" size="sm" onClick={() => setExtractedText(null)}>Clear</Button>
                </h3>
                <p className="whitespace-pre-wrap text-sm text-green-800 max-h-60 overflow-y-auto dark:text-green-200">{extractedText}</p>
              </div>
            )}

            <Separator className="mb-6" />
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFiles.map((file) => (
                  <Card
                    key={file.id}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle
                        className={cn(
                          "text-sm flex justify-between items-center",
                          statusVariants[
                            file.status as keyof typeof statusVariants
                          ]?.color
                        )}
                      >
                        <span className="text-sm">{file.name}</span>
                        <div className="flex items-center">
                          {
                            statusVariants[
                              file.status as keyof typeof statusVariants
                            ]?.icon
                          }
                          <Badge
                            variant="outline"
                            className={cn(
                              "px-2 py-1 rounded-full text-sm font-medium",
                              statusVariants[
                                file.status as keyof typeof statusVariants
                              ]?.color
                            )}
                          >
                            {file.status}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on: {file.uploadedAt}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        {
                          categoryIcons[
                            file.category as keyof typeof categoryIcons
                          ]?.icon
                        }{" "}
                        {file.category}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
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
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => setSelectedFile(file)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
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
                                ? prevFiles.filter(
                                    (prevFile) => prevFile.id !== file.id
                                  )
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
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

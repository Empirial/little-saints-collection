import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, XCircle, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssetUploaderProps {
  character: string;
  folder: string;
  folderType: "special" | "theme";
  expectedFileCount: number;
  onComplete: () => void;
}

interface FileUploadStatus {
  name: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

const AssetUploader = ({ character, folder, folderType, expectedFileCount, onComplete }: AssetUploaderProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFileName = (name: string): boolean => {
    const lowerName = name.toLowerCase();
    
    // For Cover folder, expect "cover.jpg"
    if (folder === "Cover") {
      return lowerName === "cover.jpg";
    }
    
    // For Intro and Ending folders, expect "1.jpg" or "2.jpg"
    if (folder === "Intro" || folder === "Ending") {
      const match = lowerName.match(/^(\d+)\.jpg$/);
      if (!match) return false;
      const num = parseInt(match[1], 10);
      return num >= 1 && num <= 2;
    }
    
    // For theme folders, expect "1.jpg" to "26.jpg"
    const match = lowerName.match(/^(\d+)\.jpg$/);
    if (!match) return false;
    const num = parseInt(match[1], 10);
    return num >= 1 && num <= 26;
  };

  const getExpectedFileNames = (): string => {
    if (folder === "Cover") return "cover.jpg";
    if (folder === "Intro" || folder === "Ending") return "1.jpg, 2.jpg";
    return "1.jpg to 26.jpg";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "image/jpeg" && validateFileName(file.name)
    );

    if (droppedFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: `Please drop JPG files named ${getExpectedFileNames()}`,
        variant: "destructive",
      });
      return;
    }

    setFiles(droppedFiles);
    setUploadStatuses(
      droppedFiles.map((f) => ({ name: f.name, status: "pending" }))
    );
  }, [toast, folder]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files).filter(
      (file) => file.type === "image/jpeg" && validateFileName(file.name)
    );

    if (selectedFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: `Please select JPG files named ${getExpectedFileNames()}`,
        variant: "destructive",
      });
      return;
    }

    setFiles(selectedFiles);
    setUploadStatuses(
      selectedFiles.map((f) => ({ name: f.name, status: "pending" }))
    );
  }, [toast, folder]);

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const totalFiles = files.length;
    let completedFiles = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `${character}/${folder}/${file.name.toLowerCase()}`;

      setUploadStatuses((prev) =>
        prev.map((s) =>
          s.name === file.name ? { ...s, status: "uploading" } : s
        )
      );

      try {
        const { error } = await supabase.storage
          .from("book-assets")
          .upload(filePath, file, { upsert: true });

        if (error) throw error;

        setUploadStatuses((prev) =>
          prev.map((s) =>
            s.name === file.name ? { ...s, status: "success" } : s
          )
        );
      } catch (error: any) {
        setUploadStatuses((prev) =>
          prev.map((s) =>
            s.name === file.name
              ? { ...s, status: "error", error: error.message }
              : s
          )
        );
      }

      completedFiles++;
      setUploadProgress((completedFiles / totalFiles) * 100);
    }

    setIsUploading(false);
    
    const successCount = uploadStatuses.filter(s => s.status === "success").length + 1;
    toast({
      title: "Upload complete",
      description: `${successCount} files uploaded to ${character}/${folder}`,
    });

    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const successCount = uploadStatuses.filter((s) => s.status === "success").length;
  const errorCount = uploadStatuses.filter((s) => s.status === "error").length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop JPG files here, or click to select
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Expected files: <strong>{getExpectedFileNames()}</strong>
        </p>
        <input
          type="file"
          accept=".jpg,.jpeg"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
        />
        <Button asChild variant="outline" size="sm">
          <label htmlFor="file-input" className="cursor-pointer">
            Select Files
          </label>
        </Button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {files.length} files selected (expecting {expectedFileCount})
            </span>
            <Button
              onClick={uploadFiles}
              disabled={isUploading}
              size="sm"
            >
              {isUploading ? "Uploading..." : "Upload All"}
            </Button>
          </div>

          {isUploading && (
            <Progress value={uploadProgress} className="h-2" />
          )}

          <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2">
            {uploadStatuses.map((status) => (
              <div
                key={status.name}
                className="flex items-center gap-2 text-sm py-1"
              >
                {status.status === "pending" && (
                  <FileImage className="h-4 w-4 text-muted-foreground" />
                )}
                {status.status === "uploading" && (
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                {status.status === "success" && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {status.status === "error" && (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={status.status === "error" ? "text-red-600" : ""}>
                  {status.name}
                </span>
                {status.error && (
                  <span className="text-xs text-red-500 ml-auto">
                    {status.error}
                  </span>
                )}
              </div>
            ))}
          </div>

          {(successCount > 0 || errorCount > 0) && (
            <div className="text-sm text-muted-foreground">
              {successCount > 0 && (
                <span className="text-green-600 mr-4">
                  ✓ {successCount} uploaded
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600">✗ {errorCount} failed</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetUploader;

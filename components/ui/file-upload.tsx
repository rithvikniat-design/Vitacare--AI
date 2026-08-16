"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface FileUploadProps {
  onUploadComplete?: (fileData: { url: string; path: string; name: string; type: string }) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  className,
  accept = {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const supabase = createClient();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Explicit Client-Side Validation
      const allowedTypes = Object.keys(accept);
      if (!allowedTypes.includes(file.type)) {
        if (onUploadError) onUploadError(new Error("Invalid file type. Please upload a supported format."));
        return;
      }
      if (file.size > maxSize) {
        if (onUploadError) onUploadError(new Error(`File exceeds maximum size of ${maxSize / (1024 * 1024)}MB.`));
        return;
      }

      setIsUploading(true);
      setUploadProgress(10); // Fake initial progress

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Get user session to ensure upload works
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error("You must be logged in to upload files.");
        }

        setUploadProgress(40);

        const { data, error } = await supabase.storage
          .from("medical_files")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          throw error;
        }

        setUploadProgress(90);

        const { data: urlData, error: urlError } = await supabase.storage
          .from("medical_files")
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (urlError || !urlData) {
          throw new Error("Failed to generate secure URL for file.");
        }

        setUploadProgress(100);

        if (onUploadComplete) {
          onUploadComplete({
            url: urlData.signedUrl,
            path: filePath,
            name: file.name,
            type: file.type,
          });
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        if (onUploadError) onUploadError(err);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [onUploadComplete, onUploadError, supabase]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : isDragReject
          ? "border-destructive bg-destructive/5"
          : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
        isUploading && "pointer-events-none opacity-60",
        className
      )}
    >
      <input {...getInputProps()} />
      
      {isUploading ? (
        <div className="flex flex-col items-center space-y-2 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2 text-muted-foreground">
          <UploadCloud className={cn("w-8 h-8", isDragActive && "text-primary")} />
          <p className="text-sm font-medium text-center">
            {isDragActive
              ? "Drop the file here"
              : "Drag & drop a medical file, or click to select"}
          </p>
          <p className="text-xs opacity-70">
            Supports PDF, DOCX, JPG, PNG (Max 10MB)
          </p>
        </div>
      )}
    </div>
  );
}

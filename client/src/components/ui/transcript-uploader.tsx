"use client";

import { IconButton } from "@chakra-ui/react";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toaster } from "./toaster";
import { Tooltip } from "./tooltip";

interface TranscriptUploaderProps {
  onUploadSuccess?: (title: string) => void;
}

export default function TranscriptUploader({
  onUploadSuccess,
}: TranscriptUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result as string;
      const title = file.name.replace(/\.[^/.]+$/, "");

      const toastId = toaster.create({
        type: "loading",
        title: "Uploading transcript...",
        description: `Indexing "${title}"`,
        meta: { closable: false },
      });

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/agent/upload/${title}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: text }),
          }
        );

        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          const errorMessage =
            errorBody?.message || `Upload failed with status ${res.status}`;
          throw new Error(errorMessage);
        }

        toaster.update(toastId, {
          type: "success",
          title: "Upload complete",
          description: `"${title}" was successfully indexed.`,
          meta: { closable: true },
        });

        onUploadSuccess?.(title);
      } catch (err) {
        toaster.update(toastId, {
          type: "error",
          title: "Upload failed",
          description: (err as Error).message || "Could not upload file.",
          meta: { closable: true },
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <input
        type="file"
        accept=".txt"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <Tooltip content="Upload transcript (.txt)" showArrow>
        <IconButton
          aria-label="Upload transcript"
          size="sm"
          onClick={() => inputRef.current?.click()}
          isLoading={isUploading}
          isDisabled={isUploading}
          variant="outline"
        >
          <Upload size={18} color="currentColor" />
        </IconButton>
      </Tooltip>
    </>
  );
}

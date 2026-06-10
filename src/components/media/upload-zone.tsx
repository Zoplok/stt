"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileVideo, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn, formatFileSize, isValidMediaType } from "@/lib/utils";

interface UploadZoneProps {
  onComplete: (file: { name: string; url: string; key: string }) => void;
  maxSizeMB?: number;
}

type UploadState = "idle" | "dragging" | "uploading" | "done" | "error";

export function UploadZone({ onComplete, maxSizeMB = 2048 }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const validate = (file: File): string | null => {
    if (!isValidMediaType(file.type)) {
      return `Unsupported file type: ${file.type}. Use MP4, MOV, MKV, MP3, WAV, or M4A.`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File exceeds ${maxSizeMB}MB limit.`;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const error = validate(file);
    if (error) {
      setErrorMsg(error);
      setState("error");
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setState("uploading");
    setProgress(0);

    abortRef.current = new AbortController();

    try {
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
        signal: abortRef.current.signal,
      });

      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, key, publicUrl } = await presignRes.json() as { uploadUrl: string; key: string; publicUrl: string };

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.statusText}`));
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        abortRef.current!.signal.addEventListener("abort", () => xhr.abort());
        xhr.send(file);
      });

      setState("done");
      onComplete({ name: file.name, url: publicUrl, key });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setState("idle");
      } else {
        setErrorMsg((err as Error).message ?? "Upload failed");
        setState("error");
      }
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    []
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  };

  const onDragLeave = () => setState("idle");

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const reset = () => {
    abortRef.current?.abort();
    setState("idle");
    setProgress(0);
    setFileName("");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => state === "idle" && inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-48 p-8",
        state === "dragging"
          ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
          : state === "uploading" || state === "done"
          ? "border-white/10 cursor-default"
          : state === "error"
          ? "border-red-500/40 bg-red-500/5"
          : "border-white/10 hover:border-white/20 hover:bg-white/3"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="video/mp4,video/quicktime,video/x-matroska,video/webm,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
        onChange={onInputChange}
      />

      <AnimatePresence mode="wait">
        {state === "idle" || state === "dragging" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
              state === "dragging" ? "bg-emerald-500/20" : "bg-white/5")}>
              <Upload className={cn("w-6 h-6 transition-colors", state === "dragging" ? "text-emerald-400" : "text-white/40")} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">
                {state === "dragging" ? "Drop to upload" : "Drop your file here or click to browse"}
              </p>
              <p className="text-xs text-white/30 mt-1">MP4, MOV, MKV, MP3, WAV, M4A · Up to {maxSizeMB}MB</p>
            </div>
          </motion.div>
        ) : state === "uploading" ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center gap-4"
          >
            <FileVideo className="w-8 h-8 text-emerald-400" />
            <div className="w-full">
              <div className="flex justify-between text-xs text-white/50 mb-2">
                <span className="truncate max-w-[200px]">{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-white/30 mt-2 text-center">{formatFileSize(fileSize)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </motion.div>
        ) : state === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <p className="text-sm font-medium text-emerald-400">Upload complete!</p>
            <p className="text-xs text-white/40 truncate max-w-[220px]">{fileName}</p>
          </motion.div>
        ) : (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-red-400 font-medium">Upload failed</p>
            <p className="text-xs text-white/40 max-w-[280px]">{errorMsg}</p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors underline"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

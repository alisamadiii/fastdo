"use client";

import React, { useEffect, useState } from "react";
import {
  motion,
  useAnimate,
  AnimatePresence,
  MotionConfig,
} from "motion/react";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/spinner";

const urlSchema = z.string().url();

interface FileNode {
  name: string;
  path: string;
  type: string;
  children: FileNode[];
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

function organizeFiles(files: TemplateFile[]): FileNode[] {
  const root: FileNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const existing = currentLevel.find((node) => node.name === part);

      if (existing) {
        currentLevel = existing.children;
      } else {
        const newNode: FileNode = {
          name: part,
          path: parts.slice(0, index + 1).join("/"),
          type: isLast ? file.type : "directory",
          children: [],
          size: file.size,
        };
        currentLevel.push(newNode);
        currentLevel = newNode.children;
      }
    });
  });

  return root;
}

function FileTree({ node, level = 0 }: { node: FileNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 1);

  return (
    <div className="space-y-1">
      <motion.div initial={false} className="flex items-center gap-2 text-sm">
        {node.type === "directory" && (
          <motion.button
            initial={false}
            animate={{ rotate: isOpen ? 90 : 0 }}
            className="p-1 hover:bg-muted rounded-md"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        )}
        {node.type !== "directory" && (
          <div className="w-6" /> // Spacing for files
        )}
        <span className={`${node.type === "directory" ? "font-medium" : ""}`}>
          {node.name}
        </span>
        {node.type !== "directory" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {node.type}
          </span>
        )}
        {node.type !== "directory" && (
          <span className="text-xs px-2 py-0.5 ml-auto rounded-full bg-muted text-muted-foreground">
            {formatFileSize(node.size)}
          </span>
        )}
      </motion.div>

      <AnimatePresence initial={false}>
        {isOpen && node.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-4 pl-4 border-l space-y-1"
          >
            {node.children
              .sort((a, b) => {
                // Directories first, then alphabetically
                if (a.type === "directory" && b.type !== "directory") return -1;
                if (a.type !== "directory" && b.type === "directory") return 1;
                return a.name.localeCompare(b.name);
              })
              .map((child) => (
                <FileTree key={child.path} node={child} level={level + 1} />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GithubDir() {
  const [files, setFiles] = useState<TemplateFile[] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const [scope, animate] = useAnimate<HTMLFormElement>();

  useEffect(() => {
    if (window) {
      setToken(window.localStorage.getItem("github-token"));
    }
  }, []);

  const contentsQuery = useQuery({
    queryKey: ["download-contents", files],
    queryFn: async () => {
      try {
        if (!files) return null;

        // Batch files into groups of 5
        const BATCH_SIZE = 5;
        const results = [...files];

        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const batch = files.slice(i, i + BATCH_SIZE);

          const response = await fetch("/api/github-content", {
            method: "POST",
            headers: {
              "api-token-x": token || "", // Make sure you have access to the token
            },
            body: JSON.stringify({
              files: batch,
            }),
          });

          const data = await response.json();

          console.log({ data });

          // Update the results array with the fetched contents
          data.files.forEach((file: any, index: number) => {
            if (file.success) {
              results[i + index] = {
                ...results[i + index],
                content: file.content,
              };
            }
          });
        }

        return results;
      } catch (error) {
        console.error("Error fetching contents:", error);
        throw error;
      }
    },
    enabled: !!files,
  });

  const downloadDir = useMutation({
    mutationFn: async ({
      url,
      isToken,
    }: {
      url: string | null;
      isToken?: boolean;
    }) => {
      if (!isToken) {
        if (!url) {
          throw new Error("Please enter a valid url");
        }

        const parsedUrl = urlSchema.safeParse(url);

        if (!parsedUrl.success) {
          throw new Error("Please enter a valid url");
        }

        if (!url.includes("github.com")) {
          throw new Error(
            "Please enter a valid GitHub repository URL (e.g. https://github.com/username/repository)"
          );
        }
      }

      const result = await fetch(`/api/github-dir?url=${url}`, {
        headers: {
          "api-token-x": token || "",
        },
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error);
      }

      console.log(data);

      return data.files;
    },
    onSuccess: (result) => {
      setFiles(result);
      (document.activeElement as HTMLElement)?.blur();
      console.log("Success");
    },
    onError: () => {
      console.log("Error");
      setFiles(null);
      animate(
        scope.current,
        {
          x: [0, -2, 2, -2, 2, -1, 1, 0],
          "--border-color": "red",
        },
        {
          duration: 0.5,
          ease: "easeInOut",
        }
      );
    },
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    downloadDir.mutate({ url });
  };

  const renderFiles = () => {
    if (!files) return null;

    const fileTree = organizeFiles(files);

    return (
      <motion.div
        layout
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="rounded-lg border bg-card p-4">
          <div className="space-y-2">
            {fileTree.map((node) => (
              <FileTree key={node.path} node={node} />
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-[70dvh] flex items-center py-24 flex-col gap-2 justify-center">
      <MotionConfig transition={{ duration: 0.5, type: "spring", bounce: 0 }}>
        <motion.div
          layout="position"
          className="flex flex-col relative z-20 gap-2 items-center mb-4 w-full max-w-xl"
        >
          <motion.div layout="position">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-40"
            >
              <path
                d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21V19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26V21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z"
                fill="url(#paint0_linear_118_2)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_118_2"
                  x1="12"
                  y1="2"
                  x2="12"
                  y2="21.5155"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="40%" stopColor="var(--foreground)" />
                  <stop offset="100%" stopColor="var(--muted-foreground)" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <form
            ref={scope}
            className={cn(
              "rounded-full relative border h-12 w-full focus-within:ring-4 focus-within:ring-ring/30 focus-within:scale-[1.02] transition-[scale,box-shadow,border-color] duration-200 ease-in-out flex items-stretch p-0.5 max-w-xl",
              downloadDir.isError &&
                "border-destructive focus-within:ring-destructive/10"
            )}
            onSubmit={onSubmit}
          >
            {downloadDir.isPending && <BorderBeam />}

            <input
              name="url"
              type="text"
              placeholder="https://github.com/username/repo"
              className="grow px-4 outline-none transition-colors duration-300 rounded-full"
              value={url || ""}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
            />
            <Button
              variant="outline"
              className="rounded-full h-auto transition-colors duration-300 hover:bg-muted"
            >
              Create
            </Button>
          </form>
          <div className="w-full min-h-8">
            {(downloadDir.error?.message === "Missing token" ||
              downloadDir.error?.message ===
                "GitHub token is invalid or expired") && (
              <Input
                placeholder="GitHub Token"
                className="w-full mb-2"
                defaultValue={token || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setToken(value);
                  window.localStorage.setItem("github-token", value);
                  downloadDir.mutate({ url, isToken: true });
                }}
              />
            )}
            <p
              className={cn(
                "text-sm text-destructive px-4 opacity-0 transition-opacity duration-300",
                downloadDir.isError && "opacity-100"
              )}
            >
              {downloadDir.error?.message}
            </p>
          </div>
        </motion.div>
      </MotionConfig>
      {renderFiles()}

      <nav className="fixed right-0 bottom-0 left-0 z-50 flex isolate h-22 items-center justify-center">
        <div className="absolute right-0 bottom-0 left-0 -z-10 h-22 [--color:var(--background)] *:absolute *:inset-0 ">
          <div className="bg-[var(--color)]/20 backdrop-blur-[0.5px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.00)_0%,#000_10%)]" />
          <div className="bg-[var(--color)]/20 backdrop-blur-[2px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.00)_10%,#000_20%)]" />
          <div className="bg-[var(--color)]/20 backdrop-blur-[4.5px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.00)_20%,#000_30%)]" />
          <div className="bg-[var(--color)]/20 backdrop-blur-[8px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.00)_30%,#000_40%)]" />
          <div className="bg-[var(--color)]/20 backdrop-blur-[12.5px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.00)_40%,#000_50%)]" />
          <div className="bg-[var(--color)]/20 backdrop-blur-[18px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.00)_50%,#000_60%)]" />
          <div className="bg-[var(--color)]/20 backdrop-blur-[24.5px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.00)_60%,#000_70%)]" />
          <div className="bg-[var(--color)]/20 backdrop-blur-[32px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.00)_70%,#000_80%)]" />
          <div className="bg-[var(--color)]/20 backdrop-blur-[40.5px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.00)_80%,#000_90%)]" />
          <div className="bg-[var(--color)]/20 backdrop-blur-[50px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.00)_90%,#000_100%)]" />
          {/* <div className="[background:linear-gradient(180deg,rgba(9,9,11,0.00)_0%,var(--background,#09090B)_100%)]" /> */}
        </div>

        <Button
          variant="outline"
          className={cn(
            "rounded-full min-w-24 transition-opacity duration-100",
            !files && "opacity-0 pointer-events-none"
          )}
          size={"lg"}
          onClick={async () => {
            if (contentsQuery.data) {
              await downloadAsZip(contentsQuery.data);
            }
          }}
        >
          {contentsQuery.isFetching ? <Spinner /> : "Export"}
        </Button>
      </nav>
    </div>
  );
}

async function downloadAsZip(files: TemplateFile[]) {
  const zip = new JSZip();

  try {
    // Add all files to the zip in a single pass
    await Promise.all(
      files.map(async (file) => {
        if (file.type === "image" || file.type === "font") {
          // For binary files, fetch them using the download_url
          if (file.download_url) {
            const response = await fetch(file.download_url);
            const blob = await response.blob();
            zip.file(file.path, blob);
          }
        } else {
          // For text files, use the content directly
          // Make sure to check if content exists
          if (file.content !== undefined && file.content !== null) {
            zip.file(file.path, file.content);
          }
        }
      })
    );

    // Generate and download the zip
    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });

    // Use a more descriptive filename
    const filename = `github-files-${new Date()
      .toISOString()
      .slice(0, 10)}.zip`;
    saveAs(content, filename);
  } catch (error) {
    console.error("Error creating zip:", error);
    throw new Error("Failed to create zip file");
  }
}

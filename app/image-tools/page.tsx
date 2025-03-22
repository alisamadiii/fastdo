"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";

import { Input } from "@/components/ui/input";
import { formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateImages } from "./action";

export default function ImageToolsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("auto");

  const { data } = useQuery({
    queryKey: ["image-tools", file?.name, file?.size, aspectRatio],
    queryFn: async () => {
      if (!file) return;
      const arrayBuffer = await file.arrayBuffer();

      let width = 0;
      let height = 0;

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = () => {
          width = img.width;
          height = img.height;
          resolve(true);
        };
      });

      const data = await generateImages({
        aspectRatio,
        width,
        height,
        arrayBuffer,
      });

      // Create URLs directly from the base64 data
      const urls: { url: string; size: number; fileSize: number }[] =
        data.images.map(
          (image: { data: string; size: number; fileSize: number }) => {
            return {
              url: image.data,
              size: image.size,
              fileSize: image.fileSize,
            };
          }
        );

      return urls;
    },
    enabled: !!file,
  });

  const handleDownload = (url?: string, size?: number) => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name}-${size}.jpg`;
    a.click();
  };

  return (
    <div className="min-h-[70dvh] flex items-center py-24 flex-col gap-2 justify-center">
      <motion.div layout className="flex gap-3 w-full max-w-xl">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setFile(files[0]);
          }}
        />
        <Select
          defaultValue={aspectRatio}
          onValueChange={(value) => setAspectRatio(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Aspect Ratio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="1:1">1:1</SelectItem>
            <SelectItem value="4:3">4:3</SelectItem>
            <SelectItem value="16:9">16:9</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>
      <div className="max-w-4xl mt-4">
        <div className="grid grid-cols-4 gap-2 items-start">
          {file &&
            Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, delay: 0.4 }}
                key={index}
                className="rounded-xl relative overflow-hidden border"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 z-20"
                  onClick={() =>
                    handleDownload(data?.[index].url, data?.[index].size)
                  }
                >
                  <DownloadIcon />
                </Button>
                <div className="relative w-full h-full overflow-hidden">
                  {data?.[index].url && (
                    <img
                      src={data?.[index].url}
                      alt={`Processed image ${index}`}
                      className="absolute inset-0 w-full opacity-0 blur-sm z-10 h-full animate-fade-in"
                      style={{
                        animationDelay: `${index * 0.05}s`,
                      }}
                    />
                  )}
                  <img
                    src={URL.createObjectURL(file || new File([], ""))}
                    alt={`Processed image ${index}`}
                    className="w-full h-auto blur-xl scale-150"
                    style={{
                      aspectRatio: aspectRatio.replace(":", "/"),
                    }}
                  />
                </div>
                <div className="p-2 bg-muted/50 min-h-9 text-sm text-muted-foreground flex flex-col gap-1">
                  <p className="truncate">
                    {file.name.split(".")[0] + "-" + data?.[index].size}
                  </p>
                  <Badge variant="outline">
                    {formatFileSize(data?.[index].fileSize || 0)}
                  </Badge>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}

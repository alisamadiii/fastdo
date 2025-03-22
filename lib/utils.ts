import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

// const generateApiKey = () => {
//   const prefix = "fastdo_live_";
//   const randomBytes = crypto.randomBytes(16).toString("hex"); // 32 chars
//   const timestamp = Date.now().toString(36); // Base36 timestamp
//   return `${prefix}${randomBytes}_${timestamp}`;
// };

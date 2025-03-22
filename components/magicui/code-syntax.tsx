"use client";

import { FileIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface CodeSyntaxProps {
  code: string;
  language: string;
  filename: string;
  lightTheme: string;
  darkTheme: string;
  onValueChange: (value: string) => void;
}

export function CodeSyntax({
  code,
  onValueChange,
  language,
  filename,
  lightTheme,
  darkTheme,
}: CodeSyntaxProps) {
  const { theme, systemTheme } = useTheme();
  const [highlighted, setHighlighted] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);

  const codeRef = useRef<any>(null);

  useEffect(() => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    const selectedTheme = currentTheme === "dark" ? darkTheme : lightTheme;

    async function highlightCode() {
      try {
        const { codeToHtml } = await import("shiki");
        const before = await codeToHtml(code, {
          lang: language,
          theme: selectedTheme,
        });
        setHighlighted(before);
      } catch (error) {
        console.error("Error highlighting code:", error);
        setHighlighted(`<pre>${code}</pre>`);
      }
    }
    highlightCode();
  }, [theme, systemTheme, code, language, lightTheme, darkTheme]);

  const renderCode = (code: string, highlighted: string) => {
    if (highlighted) {
      return (
        <div
          ref={codeRef}
          className="overflow-auto h-screen bg-background font-mono text-xs 
            whitespace-pre-wrap break-all leading-relaxed
            [&>pre]:h-full [&>pre]:!bg-transparent [&>pre]:p-4 
            [&_code]:whitespace-pre-wrap [&_code]:break-all
            [&_code]:leading-relaxed [&_code]:inline-block [&_code]:min-w-full"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      );
    } else {
      return (
        <pre
          ref={codeRef}
          className="overflow-auto h-screen whitespace-pre-wrap break-words 
          bg-background p-4 font-mono text-xs text-foreground leading-relaxed"
        >
          {code}
        </pre>
      );
    }
  };

  console.log({ scrollPosition });

  return (
    <div className="w-full sticky top-0 overflow-hidden border-l">
      <div>
        <div className="flex items-center bg-accent p-2 text-sm text-foreground">
          <FileIcon className="mr-2 h-4 w-4" />
          {filename}
        </div>
        <div className="relative group">
          {renderCode(code, highlighted)}
          <TextareaAutosize
            className="max-h-screen absolute outline-0 inset-0 w-full text-transparent hover:opacity-100
              focus:opacity-100 p-4 font-mono text-xs caret-foreground resize-none
              whitespace-pre-wrap break-words leading-relaxed transition-opacity
              duration-200"
            value={code}
            onScroll={(e: React.UIEvent<HTMLTextAreaElement>) => {
              setScrollPosition(e.currentTarget.scrollTop);
              if (codeRef.current) {
                codeRef.current.scrollTop = e.currentTarget.scrollTop;
              }
            }}
            onChange={(e) => onValueChange(e.currentTarget.value)}
          />
        </div>
      </div>
    </div>
  );
}

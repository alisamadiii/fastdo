import Link from "next/link";
import React from "react";
import { buttonVariants } from "./ui/button";
import { Github } from "lucide-react";

export default function Links() {
  return (
    <div className="flex gap-2 fixed top-4 right-4">
      <Link
        href="https://github.com/alisamadiii/fastdo"
        target="_blank"
        className={buttonVariants({ variant: "outline" })}
      >
        <Github className="size-4" /> Support on GitHub
      </Link>
    </div>
  );
}

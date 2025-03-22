"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-md bg-stone-900 p-1">
              <div className="h-6 w-6 rounded-sm bg-white/20"></div>
            </div>
            <span className="text-xl font-bold">FastTools</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#"
            className="text-stone-600 hover:text-stone-900 transition-colors"
          >
            Tools
          </Link>
          <Link
            href="#"
            className="text-stone-600 hover:text-stone-900 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-stone-600 hover:text-stone-900 transition-colors"
          >
            Documentation
          </Link>
          <Link
            href="#"
            className="text-stone-600 hover:text-stone-900 transition-colors"
          >
            Blog
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="#"
            className="text-stone-600 hover:text-stone-900 transition-colors"
          >
            Sign In
          </Link>
          <Button className="bg-stone-800 hover:bg-stone-900">Sign Up</Button>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="border-none">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 pt-6">
              <Link
                href="#"
                className="text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Tools
              </Link>
              <Link
                href="#"
                className="text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Documentation
              </Link>
              <Link
                href="#"
                className="text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Sign In
                </Button>
                <Button
                  className="bg-stone-800 hover:bg-stone-900"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowRight,
  Github,
  Code,
  FolderTree,
  Layers,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <AuroraBackground className="fixed top-0 left-0 w-full h-full -z-10">
        <></>
      </AuroraBackground>
      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* Profile and Social Links */}
        <div className="mb-12 flex flex-col items-center md:flex-row md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-neutral-900">
              <div className="h-6 w-6 rounded-sm bg-neutral-50"></div>
            </div>
            <h1 className="text-xl font-bold">FastDo</h1>
          </div>

          <div className="mt-6 flex items-center gap-4 md:mt-0">
            <Link
              href="#"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="#"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <Code className="h-5 w-5" />
              <span className="sr-only">Documentation</span>
            </Link>
          </div>
        </div>

        {/* Featured Tool Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <Card className="overflow-hidden bg-neutral-900 text-neutral-50">
            <CardContent className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  GitHub Directory Downloader
                </h2>
                <p className="text-neutral-300 max-w-2xl">
                  Download any GitHub directory without cloning the entire
                  repository. Fast and efficient.
                </p>
              </div>
              <Button
                asChild
                className="shrink-0 bg-neutral-50 text-neutral-900 hover:bg-neutral-200"
              >
                <Link href="/github-dir">Visit</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="mb-16 max-w-3xl">
          <h2 className="mb-6 text-4xl font-bold">Fast DO</h2>
          <p className="mb-6 text-lg text-neutral-700">
            Speed up your workflow with our collection of developer tools.
            Download GitHub directories, process images, and more - all in one
            place.
          </p>
        </div>

        {/* What We Offer Section */}
        <div className="mb-16">
          <h3 className="mb-6 text-xl font-medium">What we offer</h3>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <GithubToolCard />
            <ImageToolCard />
            <ComingSoonCard />
          </div>
        </div>
      </main>

      <footer className="mt-24 border-t border-neutral-200 py-8">
        <div className="container mx-auto px-4">
          <p className="text-neutral-500 text-sm">
            Developed by{" "}
            <Link
              href="https://x.com/alisamadi__"
              target="_blank"
              className="underline"
            >
              Ali Samadi
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function GithubToolCard() {
  return (
    <div className="relative hover:-translate-y-0.5 transition-all duration-300">
      <Link href="/github-dir" className="block">
        <Card className="overflow-hidden border-0 shadow-sm p-0">
          <div className="relative h-32 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Github className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-6 left-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-md">
                <FolderTree className="h-6 w-6 text-gray-800" />
              </div>
            </div>
          </div>
          <CardContent className="pt-8">
            <CardTitle className="text-xl">
              GitHub Directory Downloader
            </CardTitle>
            <CardDescription className="mt-2 text-neutral-600">
              Download any GitHub directory without cloning the entire
              repository. Fast and efficient.
            </CardDescription>
          </CardContent>
          <CardFooter className="border-t border-neutral-100 bg-neutral-50 px-6 py-3">
            <div className="flex items-center text-sm font-medium text-neutral-900">
              Try it <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  );
}

function ImageToolCard() {
  return (
    <div className="relative hover:-translate-y-0.5 transition-all duration-300">
      <Link href="#" className="block">
        <Card className="overflow-hidden border-0 shadow-sm p-0">
          <div className="relative h-32 bg-gradient-to-r from-emerald-600 to-teal-500">
            <div className="absolute right-4 top-4 grid grid-cols-2 gap-1">
              <div className="h-5 w-5 rounded-sm bg-white/20"></div>
              <div className="h-5 w-5 rounded-sm bg-white/30"></div>
              <div className="h-5 w-5 rounded-sm bg-white/30"></div>
              <div className="h-5 w-5 rounded-sm bg-white/20"></div>
            </div>
            <div className="absolute -bottom-6 left-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-md">
                <Layers className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <CardContent className="pt-8">
            <CardTitle className="text-xl">Image Tools</CardTitle>
            <CardDescription className="mt-2 text-neutral-600">
              Resize, compress, and convert images instantly. Support for
              multiple formats and batch processing.
            </CardDescription>
          </CardContent>
          <CardFooter className="border-t border-neutral-100 bg-neutral-50 px-6 py-3">
            <div className="flex items-center text-sm font-medium text-neutral-900">
              Try it <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  );
}

function ComingSoonCard() {
  return (
    <div className="relative hover:-translate-y-0.5 transition-all duration-300">
      <Link href="#" className="block">
        <Card className="overflow-hidden border-0 shadow-sm p-0">
          <div className="relative h-32 bg-gradient-to-r from-amber-500 to-orange-400">
            <div className="absolute right-4 top-4">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-white/30"></div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-md">
                <Zap className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </div>
          <CardContent className="pt-8">
            <CardTitle className="text-xl">More Coming Soon</CardTitle>
            <CardDescription className="mt-2 text-neutral-600">
              We&apos;re working on more tools to help streamline your
              development workflow. Stay tuned!
            </CardDescription>
          </CardContent>
          <CardFooter className="border-t border-neutral-100 bg-neutral-50 px-6 py-3">
            <div className="flex items-center text-sm font-medium text-neutral-900">
              Get notified <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  );
}

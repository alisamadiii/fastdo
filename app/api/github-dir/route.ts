import { Octokit } from "@octokit/rest";
import { Base64 } from "js-base64";

interface GithubContent {
  path: string;
  type: string;
  content?: string;
  size?: number;
  sha: string;
  download_url: string | null;
}

async function getDirectoryContents(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<GithubContent[]> {
  const contents: GithubContent[] = [];

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      if (item.type === "dir") {
        // Recursively get contents of directories
        const nestedContents = await getDirectoryContents(
          octokit,
          owner,
          repo,
          item.path,
          branch
        );
        contents.push(...nestedContents);
      } else if (item.type === "file") {
        contents.push({
          path: item.path,
          type: getFileType(item.path),
          content: item.content ? Base64.decode(item.content) : "",
          size: item.size,
          sha: item.sha,
          download_url: item.download_url,
        });
      }
    }
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
  }

  return contents;
}

class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenError";
  }
}

async function validateToken(octokit: Octokit) {
  try {
    // Try to make a simple API call to verify token
    await octokit.users.getAuthenticated();
    return true;
  } catch (error: any) {
    if (error.status === 401) {
      throw new TokenError("GitHub token is invalid or expired");
    }
    if (error.status === 403) {
      throw new TokenError("GitHub token has insufficient permissions");
    }
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get("api-token-x");

    if (!token) {
      return Response.json({ error: "Missing token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return Response.json({ error: "Missing URL parameter" }, { status: 400 });
    }

    const octokit = new Octokit({ auth: token });

    try {
      await validateToken(octokit);
    } catch (error) {
      if (error instanceof TokenError) {
        return Response.json(
          {
            error: error.message,
            code: "TOKEN_INVALID",
          },
          { status: 401 }
        );
      }
      throw error;
    }

    const { owner, repo, path, branch } = extractGitHubInfo(url);

    if (!owner || !repo) {
      return Response.json(
        { error: "Invalid GitHub URL format" },
        { status: 400 }
      );
    }

    // Get all contents recursively
    const files = await getDirectoryContents(
      octokit,
      owner,
      repo,
      path || "",
      branch
    );

    // Remove the base path prefix from file paths if we're in a subdirectory
    const processedFiles = files.map((file) => ({
      ...file,
      path: path ? file.path.replace(`${path}/`, "") : file.path,
    }));

    if (files.length === 0) {
      return Response.json(
        { error: "No files found in specified directory" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      files: processedFiles,
      path,
    });
  } catch (error) {
    console.error("Server error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch template",
      },
      { status: 500 }
    );
  }
}

function extractGitHubInfo(url: string) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const owner = parts[0];
    const repo = parts[1];
    const treeIndex = parts.indexOf("tree");
    const path = treeIndex !== -1 ? parts.slice(treeIndex + 2).join("/") : "";
    const branch = treeIndex !== -1 ? parts[treeIndex + 1] : "main";

    return { owner, repo, path, branch };
  } catch (error) {
    console.error("Error extracting GitHub info:", error);
    throw new Error("Invalid GitHub URL format");
  }
}

function getFileType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();

  const typeMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    md: "markdown",
    css: "css",
    scss: "scss",
    less: "less",
    html: "html",
    svg: "svg",
    png: "image",
    jpg: "image",
    jpeg: "image",
    gif: "image",
    ico: "image",
    woff: "font",
    woff2: "font",
    ttf: "font",
    eot: "font",
  };

  return typeMap[ext || ""] || "text";
}

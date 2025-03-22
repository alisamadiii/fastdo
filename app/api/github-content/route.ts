export async function POST(request: Request) {
  try {
    const token = request.headers.get("api-token-x");

    if (!token) {
      return Response.json({ error: "Missing token" }, { status: 401 });
    }

    const body = await request.json();
    const { files } = body;

    if (!files || !Array.isArray(files)) {
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Fetch content for multiple files in parallel using download_url
    const results = await Promise.all(
      files.map(async (file: { path: string; download_url: string }) => {
        try {
          if (!file.download_url) {
            return {
              path: file.path,
              error: "No download URL available",
              success: false,
            };
          }

          const response = await fetch(file.download_url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const content = await response.text();

          return {
            path: file.path,
            content,
            success: true,
          };
        } catch (error) {
          console.error(`Error fetching ${file.path}:`, error);
          return {
            path: file.path,
            error: "Failed to fetch content",
            success: false,
          };
        }
      })
    );

    return Response.json({ files: results });
  } catch (error) {
    console.error("Server error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch content",
      },
      { status: 500 }
    );
  }
}

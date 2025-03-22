import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.CUSTOM_API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Get the raw binary data directly
    const data = await request.arrayBuffer();
    const buffer = Buffer.from(data);

    // Get any additional params from the URL
    const { searchParams } = new URL(request.url);
    const aspectRatio = searchParams.get("aspectRatio");
    const width = searchParams.get("width");
    const height = searchParams.get("height");

    if (!width || !height) {
      return NextResponse.json(
        { error: "Width and height are required" },
        { status: 400 }
      );
    }

    const getAspectRatioDimensions = (width: number) => {
      if (aspectRatio === "1:1") return { width, height: width };
      if (aspectRatio === "16:9")
        return { width, height: Math.round((width * 9) / 16) };
      if (aspectRatio === "4:3")
        return { width, height: Math.round((width * 3) / 4) };
      if (aspectRatio === "3:2")
        return { width, height: Math.round((width * 2) / 3) };
      return { width, height: null };
    };

    const [preview, small, medium, large, original] = await Promise.all([
      sharp(buffer)
        .resize(
          getAspectRatioDimensions(100).width,
          getAspectRatioDimensions(100).height,
          {
            withoutEnlargement: true,
            fit: aspectRatio === "auto" ? "inside" : "cover",
          }
        )
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer(),
      // Small size for mobile (400px)
      sharp(buffer)
        .resize(
          getAspectRatioDimensions(400).width,
          getAspectRatioDimensions(400).height,
          {
            withoutEnlargement: true,
            fit: aspectRatio === "auto" ? "inside" : "cover",
          }
        )
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer(),

      // Medium size for tablets/desktop (800px)
      sharp(buffer)
        .resize(
          getAspectRatioDimensions(800).width,
          getAspectRatioDimensions(800).height,
          {
            withoutEnlargement: true,
            fit: aspectRatio === "auto" ? "inside" : "cover",
          }
        )
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer(),
      // large size for desktop (1000px)
      sharp(buffer)
        .resize(
          getAspectRatioDimensions(Number(width)).width,
          getAspectRatioDimensions(Number(width)).height,
          {
            withoutEnlargement: true,
            fit: aspectRatio === "auto" ? "inside" : "cover",
          }
        )
        .jpeg({
          quality: 85,
          mozjpeg: true,
        })
        .toBuffer(),
      buffer,
    ]);

    return NextResponse.json({
      success: true,
      images: [
        {
          size: "preview",
          data: `data:image/jpeg;base64,${preview.toString("base64")}`,
          filename: "image-preview.jpg",
          fileSize: preview.length,
        },
        {
          size: "small",
          data: `data:image/jpeg;base64,${small.toString("base64")}`,
          filename: "image-small.jpg",
          fileSize: small.length,
        },
        {
          size: "medium",
          data: `data:image/jpeg;base64,${medium.toString("base64")}`,
          filename: "image-medium.jpg",
          fileSize: medium.length,
        },
        {
          size: "large",
          data: `data:image/jpeg;base64,${large.toString("base64")}`,
          filename: "image-large.jpg",
          fileSize: large.length,
        },
        {
          size: "original",
          data: `data:image/jpeg;base64,${original.toString("base64")}`,
          filename: "image-original.jpg",
          fileSize: original.length,
        },
      ],
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

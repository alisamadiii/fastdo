"use server";

export async function generateImages({
  aspectRatio,
  width,
  height,
  arrayBuffer,
}: {
  aspectRatio: string;
  width: number;
  height: number;
  arrayBuffer: ArrayBuffer;
}) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/image-tool?aspectRatio=${aspectRatio}&width=${width}&height=${height}`,
      {
        method: "POST",
        body: arrayBuffer,
        headers: {
          "x-api-key": process.env.CUSTOM_API_KEY || "",
        },
      }
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate images" };
  }
}

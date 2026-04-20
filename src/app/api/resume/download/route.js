
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, basename } from "path";
import siteMetadata from "@/utils/metaData";

export async function GET() {
  try {
    const resumePath = siteMetadata.resume;
    const fileName = basename(resumePath);
    const normalizedResumePath = resumePath.replace(/^\//, "");
    const file = await readFile(join(process.cwd(), "public", normalizedResumePath));
    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    console.error("Error reading resume file:", error);
    return new NextResponse("Resume not found.", { status: 404 });
  }
}

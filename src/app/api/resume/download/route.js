
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, basename } from "path";
import siteMetadata from "@/utils/metaData";

export async function GET() {
  try {
    const resumePath = siteMetadata.resume;
    const fileName = basename(resumePath);
    const file = await readFile(join(process.cwd(), "public", fileName));
    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Built_By_JC_Resume.pdf"',
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    console.error("Error reading resume file:", error);
    return new NextResponse("Resume not found.", { status: 404 });
  }
}

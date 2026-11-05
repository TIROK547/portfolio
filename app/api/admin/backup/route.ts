import { NextRequest, NextResponse } from "next/server";
import { guardApi } from "@/lib/auth";
import { statSync, readdirSync } from "fs";
import { join } from "path";
import { PassThrough } from "stream";
import { ZipArchive } from "archiver";

const DATA_DIR = process.env.DATA_DIR ?? "./data";

export async function GET(req: NextRequest) {
  const denied = await guardApi(req);
  if (denied) return denied;

  const dbPath = join(DATA_DIR, "site.db");
  const uploadsPath = join(DATA_DIR, "uploads");

  // Verify DB exists before we start streaming
  try {
    statSync(dbPath);
  } catch {
    return NextResponse.json({ error: "Database not found" }, { status: 500 });
  }

  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `portfolio-backup-${date}.zip`;

  // Build the zip via a PassThrough stream so we can hand it to NextResponse
  const pass = new PassThrough();
  const archive = new ZipArchive({ zlib: { level: 6 } });

  archive.on("error", (err) => {
    console.error("[backup] archiver error:", err);
    pass.destroy(err);
  });

  archive.pipe(pass);

  // Add the SQLite database
  archive.file(dbPath, { name: "site.db" });

  // Add uploads directory (may not exist on a fresh install)
  try {
    readdirSync(uploadsPath);
    archive.directory(uploadsPath, "uploads");
  } catch {
    // uploads/ doesn't exist yet — skip silently
  }

  archive.finalize();

  // Convert Node stream → Web ReadableStream for Next.js
  const webStream = new ReadableStream({
    start(controller) {
      pass.on("data", (chunk) => controller.enqueue(chunk));
      pass.on("end", () => controller.close());
      pass.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

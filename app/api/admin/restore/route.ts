import { NextRequest, NextResponse } from "next/server";
import { guardApi } from "@/lib/auth";
import { writeFileSync, mkdirSync, existsSync, renameSync } from "fs";
import { join } from "path";
import AdmZip from "adm-zip";

const DATA_DIR = process.env.DATA_DIR ?? "./data";

export async function POST(req: NextRequest) {
  const denied = await guardApi(req);
  if (denied) return denied;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Could not parse form data" },
      { status: 400 }
    );
  }

  const file = formData.get("backup");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: "No backup file provided (field name: backup)" },
      { status: 400 }
    );
  }

  if (file.size > 500 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Backup file too large (max 500 MB)" },
      { status: 400 }
    );
  }

  // Read zip bytes
  const buffer = Buffer.from(await file.arrayBuffer());

  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
  } catch {
    return NextResponse.json(
      { error: "Invalid zip file" },
      { status: 400 }
    );
  }

  // Validate: must contain site.db
  const entries = zip.getEntries().map((e) => e.entryName);
  if (!entries.includes("site.db")) {
    return NextResponse.json(
      { error: "Invalid backup: site.db not found inside zip" },
      { status: 400 }
    );
  }

  // Security: reject path traversal attempts
  for (const name of entries) {
    if (name.includes("..") || name.startsWith("/")) {
      return NextResponse.json(
        { error: "Invalid backup: suspicious entry path" },
        { status: 400 }
      );
    }
  }

  // Ensure DATA_DIR exists
  mkdirSync(DATA_DIR, { recursive: true });

  const dbDest = join(DATA_DIR, "site.db");
  const uploadsDest = join(DATA_DIR, "uploads");
  const dbBackup = `${dbDest}.pre-restore`;

  try {
    // Snapshot existing DB so we can roll back on failure
    if (existsSync(dbDest)) {
      renameSync(dbDest, dbBackup);
    }

    // Extract site.db
    const dbEntry = zip.getEntry("site.db")!;
    writeFileSync(dbDest, dbEntry.getData());

    // Extract uploads/ entries
    mkdirSync(uploadsDest, { recursive: true });
    for (const entry of zip.getEntries()) {
      if (!entry.entryName.startsWith("uploads/")) continue;
      if (entry.isDirectory) {
        mkdirSync(join(DATA_DIR, entry.entryName), { recursive: true });
        continue;
      }
      const dest = join(DATA_DIR, entry.entryName);
      const parent = dest.substring(0, dest.lastIndexOf("/"));
      mkdirSync(parent, { recursive: true });
      writeFileSync(dest, entry.getData());
    }

    // Remove snapshot on success
    if (existsSync(dbBackup)) {
      const { unlinkSync } = await import("fs");
      unlinkSync(dbBackup);
    }

    return NextResponse.json({
      ok: true,
      message: "Restore complete. Reload the page to see updated data.",
    });
  } catch (err: any) {
    // Roll back
    if (existsSync(dbBackup)) {
      try {
        renameSync(dbBackup, dbDest);
      } catch {}
    }
    console.error("[restore] error:", err);
    return NextResponse.json(
      { error: `Restore failed: ${err?.message ?? "unknown error"}` },
      { status: 500 }
    );
  }
}

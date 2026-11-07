"use client";

import { useRef, useState } from "react";

export default function BackupRestore() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [restoreMsg, setRestoreMsg] = useState("");

  // ── Restore ──────────────────────────────────────────────────────────────
  async function handleRestore() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setRestoreMsg("Please select a backup zip file first.");
      setRestoreStatus("error");
      return;
    }

    const confirmed = window.confirm(
      "⚠️  This will overwrite ALL current data (posts, projects, uploads, settings) " +
        "with the contents of the backup.\n\nAre you sure you want to continue?"
    );
    if (!confirmed) return;

    setRestoreStatus("loading");
    setRestoreMsg("Uploading and restoring…");

    const form = new FormData();
    form.append("backup", file);

    try {
      const res = await fetch("/api/admin/restore", {
        method: "POST",
        body: form,
      });
      const json = await res.json().catch(() => ({ error: res.status === 413
        ? "Backup rejected: maximum ZIP size is 500 MB. Check the reverse proxy upload limit."
        : `Restore failed (${res.status}). Please retry.` }));

      if (res.ok && json.ok) {
        setRestoreStatus("ok");
        setRestoreMsg(json.message ?? "Restore complete.");
      } else {
        setRestoreStatus("error");
        setRestoreMsg(json.error ?? "Restore failed.");
      }
    } catch (err: any) {
      setRestoreStatus("error");
      setRestoreMsg(`Network error: ${err?.message ?? "unknown"}`);
    }
  }

  // ── Colour helpers ────────────────────────────────────────────────────────
  const statusColour =
    restoreStatus === "ok"
      ? "text-terminal-accent-green"
      : restoreStatus === "error"
      ? "text-terminal-accent-red"
      : "text-terminal-text-dark";

  return (
    <section className="border border-terminal-accent-cyan/30 rounded p-4 space-y-6">
      <h2 className="text-terminal-accent-cyan font-mono text-sm font-bold tracking-widest uppercase">
        $ backup &amp;&amp; restore
      </h2>

      {/* ── Backup ── */}
      <div className="space-y-2">
        <p className="font-mono text-xs text-terminal-text-dark/70">
          Downloads a zip containing <code>site.db</code> and{" "}
          <code>uploads/</code>. Keep this file safe — it&apos;s everything.
        </p>
        <a
          href="/api/admin/backup" download
          className="font-mono text-xs px-4 py-2 border border-terminal-accent-green text-terminal-accent-green
                     hover:bg-terminal-accent-green/10 transition-colors rounded"
        >
          [↓ Download Backup]
        </a>
      </div>

      <hr className="border-terminal-accent-cyan/10" />

      {/* ── Restore ── */}
      <div className="space-y-3">
        <p className="font-mono text-xs text-terminal-text-dark/70">
          Upload a previous backup zip to restore all data. This{" "}
          <span className="text-terminal-accent-red font-bold">
            overwrites everything
          </span>{" "}
          — you will be asked to confirm.
        </p>

        <label className="block font-mono text-xs text-terminal-text-dark/70">
          Select backup file:
          <input
            ref={fileRef}
            type="file"
            accept=".zip,application/zip"
            className="mt-1 block text-xs font-mono text-terminal-text-dark
                       file:mr-3 file:py-1 file:px-3 file:rounded
                       file:border file:border-terminal-accent-cyan/40
                       file:text-xs file:font-mono file:bg-transparent
                       file:text-terminal-accent-cyan file:cursor-pointer
                       hover:file:bg-terminal-accent-cyan/10"
          />
        </label>

        <button
          onClick={handleRestore}
          disabled={restoreStatus === "loading"}
          className="font-mono text-xs px-4 py-2 border border-terminal-accent-red text-terminal-accent-red
                     hover:bg-terminal-accent-red/10 transition-colors rounded
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {restoreStatus === "loading" ? "[⟳ Restoring…]" : "[↑ Restore Backup]"}
        </button>

        {restoreMsg && (
          <p className={`font-mono text-xs ${statusColour}`}>{restoreMsg}</p>
        )}
      </div>
    </section>
  );
}

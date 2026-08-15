import { useState } from "react";
import ReactMarkdown from "react-markdown";
import StatusBadge from "./StatusBadge";
import { downloadProspectusPdf } from "../api";

export default function DocumentPreview({ status, content, companyName, errorMessage }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const hasContent = content && content.trim().length > 0;
  const isGenerating = status === "generating";

  const handleDownload = async () => {
    setDownloadError("");
    setIsDownloading(true);
    try {
      await downloadProspectusPdf({ companyName: companyName || "prospectus", markdown: content });
    } catch (err) {
      setDownloadError(err.message || "Could not generate the PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="border border-rule rounded-lg bg-white/60 overflow-hidden">
      <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-rule bg-paper">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-brass uppercase">
            02 — Document
          </p>
          <p className="text-sm text-slate mt-0.5">
            {companyName ? `Prepared for ${companyName}` : "Awaiting a company brief"}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="bg-laid min-h-[420px] px-6 md:px-10 py-8 md:py-10">
        {!hasContent && status === "idle" && (
          <div className="h-full flex flex-col items-center justify-center text-center py-24">
            <div className="h-12 w-12 rounded-full border-2 border-rule flex items-center justify-center mb-4">
              <span className="font-display text-lg text-slate">P</span>
            </div>
            <p className="font-display text-lg text-slate">
              Your generated prospectus will appear here.
            </p>
            <p className="text-sm text-slate/70 mt-1">
              Fill in the form on the left to begin.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-24">
            <p className="font-mono text-xs tracking-widest text-rust uppercase mb-2">
              Generation Failed
            </p>
            <p className="text-sm text-ink/80 max-w-sm mx-auto">{errorMessage}</p>
          </div>
        )}

        {hasContent && (
          <div className="prospectus-body">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isGenerating && <span className="typewriter-caret">&nbsp;</span>}
          </div>
        )}
      </div>

      {status === "complete" && hasContent && (
        <div className="border-t border-rule bg-paper px-6 md:px-8 py-4 flex items-center justify-between">
          <p className="text-xs text-slate">
            {downloadError ? (
              <span className="text-rust">{downloadError}</span>
            ) : (
              "Review before sending externally."
            )}
          </p>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-5 py-2 border border-ink text-ink text-sm font-body rounded-md hover:bg-ink hover:text-paper transition-colors focus-ring disabled:opacity-50"
          >
            {isDownloading ? "Preparing PDF…" : "Download PDF ↓"}
          </button>
        </div>
      )}
    </div>
  );
}
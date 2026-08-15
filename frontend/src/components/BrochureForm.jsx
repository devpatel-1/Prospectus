import { useState } from "react";

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "humorous", label: "Humorous" },
  { value: "bold_startup", label: "Bold Startup" },
];

export default function BrochureForm({ onSubmit, isGenerating }) {
  const [companyName, setCompanyName] = useState("");
  const [url, setUrl] = useState("");
  const [tone, setTone] = useState("professional");
  const [touched, setTouched] = useState(false);

  const isValid = companyName.trim().length > 0 && url.trim().length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (!isValid || isGenerating) return;
    onSubmit({ companyName: companyName.trim(), url: url.trim(), tone });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <p className="font-mono text-[10px] tracking-widest text-brass uppercase mb-4">
          01 — Intake
        </p>
        <h2 className="font-display text-2xl font-medium text-ink">
          Tell us who you're briefing.
        </h2>
        <p className="text-sm text-slate mt-2">
          Give Prospectus a company name and its website. It reads the site
          and drafts a ready-to-share document.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="companyName"
            className="block font-mono text-[11px] tracking-widest text-slate uppercase mb-2"
          >
            Company name
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Anthropic"
            disabled={isGenerating}
            className="w-full bg-transparent border-b-2 border-rule focus:border-brass focus-ring text-lg font-body text-ink placeholder:text-slate/40 pb-2 transition-colors disabled:opacity-50"
          />
          {touched && !companyName.trim() && (
            <p className="text-xs text-rust mt-1.5">Enter a company name.</p>
          )}
        </div>

        <div>
          <label
            htmlFor="url"
            className="block font-mono text-[11px] tracking-widest text-slate uppercase mb-2"
          >
            Website URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://anthropic.com"
            disabled={isGenerating}
            className="w-full bg-transparent border-b-2 border-rule focus:border-brass focus-ring text-lg font-mono text-ink placeholder:text-slate/40 pb-2 transition-colors disabled:opacity-50"
          />
          {touched && !url.trim() && (
            <p className="text-xs text-rust mt-1.5">Enter a website URL, including https://.</p>
          )}
        </div>

        <div>
          <span className="block font-mono text-[11px] tracking-widest text-slate uppercase mb-3">
            Tone
          </span>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                disabled={isGenerating}
                onClick={() => setTone(t.value)}
                className={`px-4 py-2 rounded-full text-sm font-body border transition-colors focus-ring disabled:opacity-50 ${
                  tone === t.value
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink border-rule hover:border-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating}
        className="w-full md:w-auto px-8 py-3 bg-ink text-paper font-body font-medium rounded-md hover:bg-ink/90 transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? "Generating…" : "Generate Prospectus"}
      </button>
    </form>
  );
}
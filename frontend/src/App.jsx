import { useRef, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BrochureForm from "./components/BrochureForm";
import DocumentPreview from "./components/DocumentPreview";
import { streamProspectus } from "./api";

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | generating | complete | error
  const [content, setContent] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const abortRef = useRef(null);

  const handleGenerate = async ({ companyName: name, url, tone }) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setCompanyName(name);
    setContent("");
    setErrorMessage("");
    setStatus("generating");

    try {
      const full = await streamProspectus(
        { companyName: name, url, tone },
        (_chunk, accumulated) => setContent(accumulated),
        controller.signal
      );

      if (full.includes("[error]")) {
        setErrorMessage(full.split("[error]").pop().trim());
        setStatus("error");
        return;
      }

      setStatus("complete");
    } catch (err) {
      if (err.name === "AbortError") return;
      setErrorMessage(err.message || "Something went wrong while generating.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 md:px-10 py-10 md:py-16">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-[11px] tracking-widest text-brass uppercase mb-3">
            AI Document Assistant
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-ink leading-tight">
            Turn any company site into a ready-to-share prospectus.
          </h1>
          <p className="text-slate mt-4 text-base leading-relaxed">
            Prospectus reads a company's own website and drafts a short,
            factual brief for investors, customers, or candidates — in the
            tone you choose.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-8 lg:gap-12 items-start">
          <div className="lg:sticky lg:top-28">
            <BrochureForm onSubmit={handleGenerate} isGenerating={status === "generating"} />
          </div>

          <DocumentPreview
            status={status}
            content={content}
            companyName={companyName}
            errorMessage={errorMessage}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
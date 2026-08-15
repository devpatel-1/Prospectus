const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Streams a prospectus from the backend, calling onChunk(text) as each
 * piece arrives so the UI can render it typewriter-style.
 *
 * Returns the full accumulated text once the stream ends.
 */
export async function streamProspectus({ companyName, url, tone }, onChunk, signal) {
  const response = await fetch(`${API_BASE}/api/prospectus/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_name: companyName,
      url,
      tone,
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onChunk(chunk, full);
  }

  return full;
}

/**
 * Requests a rendered PDF for the given markdown and triggers a browser download.
 */
export async function downloadProspectusPdf({ companyName, markdown }) {
  const response = await fetch(`${API_BASE}/api/prospectus/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company_name: companyName, markdown }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || "Could not generate the PDF.");
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const filename = `${companyName.trim().replace(/\s+/g, "-").toLowerCase()}-prospectus.pdf`;

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
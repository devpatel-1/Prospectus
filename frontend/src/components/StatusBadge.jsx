const STYLES = {
  idle: {
    label: "Draft",
    dot: "bg-slate",
    text: "text-slate",
  },
  generating: {
    label: "Generating",
    dot: "bg-brass animate-pulse",
    text: "text-brass",
  },
  complete: {
    label: "Complete",
    dot: "bg-moss",
    text: "text-moss",
  },
  error: {
    label: "Error",
    dot: "bg-rust",
    text: "text-rust",
  },
};

export default function StatusBadge({ status = "idle" }) {
  const style = STYLES[status] || STYLES.idle;

  return (
    <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <span className={style.text}>{style.label}</span>
    </div>
  );
}
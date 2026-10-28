import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const CopyButton = ({ text, testId, label = "Copy" }) => {
  const [done, setDone] = useState(false);
  const copy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      toast.success("Copied", { description: text });
      setTimeout(() => setDone(false), 1400);
    } catch {
      toast.error("Clipboard not available");
    }
  };
  return (
    <button onClick={copy} data-testid={testId} aria-label={label} title={label}
      className="focus-ring rounded-md p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-amber-200">
      {done ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

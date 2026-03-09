import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { motion } from "framer-motion";

function roleMeta(role) {
  if (role === "assistant")
    return {
      badge: "AI",
      badgeClass:
        "bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-500/25",
      container: "bg-slate-900/60 ring-1 ring-inset ring-slate-800/70",
    };
  return {
    badge: "You",
    badgeClass:
      "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-500/25",
    container: "bg-slate-950/40 ring-1 ring-inset ring-slate-800/50",
  };
}

export default function Message({ role, content, isStreaming }) {
  const meta = useMemo(() => roleMeta(role), [role]);
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`rounded-2xl px-4 py-3 ${meta.container}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${meta.badgeClass}`}
          >
            {meta.badge}
          </span>
          {isStreaming ? (
            <span className="text-xs text-slate-400">streaming…</span>
          ) : null}
        </div>

        {role === "assistant" ? (
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg px-2 py-1 text-xs text-slate-300 hover:bg-slate-800/70 hover:text-white"
            title="Copy response"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>

      <div className="prose prose-invert max-w-none prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-950 prose-pre:shadow-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content || ""}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}


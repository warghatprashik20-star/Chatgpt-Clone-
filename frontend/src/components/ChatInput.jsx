import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function ChatInput({ disabled, onSend }) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus?.();
  }, []);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setText("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) submit();
    }
  }

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/60 p-3 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
        <textarea
          ref={ref}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Message AI…"
          className="min-h-[44px] max-h-40 flex-1 resize-none rounded-2xl border border-slate-800/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={disabled || !text.trim()}
          onClick={submit}
          className="inline-flex h-[44px] items-center justify-center rounded-2xl bg-indigo-500 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </motion.button>
      </div>
      <div className="mx-auto mt-2 max-w-3xl text-xs text-slate-500">
        Press <span className="font-semibold text-slate-400">Enter</span> to send,
        <span className="font-semibold text-slate-400"> Shift+Enter</span> for a
        new line.
      </div>
    </div>
  );
}


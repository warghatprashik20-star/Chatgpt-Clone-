import { useEffect, useMemo, useRef } from "react";
import Message from "./Message.jsx";
import Loader from "./Loader.jsx";

export default function ChatWindow({ messages, streamingAssistantId, error }) {
  const bottomRef = useRef(null);

  const items = useMemo(() => messages || [], [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items.length, streamingAssistantId]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-3 p-4">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950/60 p-6">
              <div className="text-lg font-semibold text-white">
                Welcome to your AI assistant
              </div>
              <div className="mt-2 text-sm leading-relaxed text-slate-300">
                Start a new chat and ask anything. Replies support Markdown and
                code highlighting.
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  "Draft a SaaS landing page hero section",
                  "Explain JWT auth with a Node.js example",
                  "Write a Python script to parse a CSV",
                  "Help me refactor a React component",
                ].map((t) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3 text-sm text-slate-200"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {items.map((m) => (
            <Message
              key={m._id || m.clientId}
              role={m.role}
              content={m.content}
              isStreaming={Boolean(
                streamingAssistantId &&
                  (m._id === streamingAssistantId ||
                    m.clientId === streamingAssistantId)
              )}
            />
          ))}

          {streamingAssistantId ? (
            <div className="rounded-2xl bg-slate-900/60 px-4 py-3 ring-1 ring-inset ring-slate-800/70">
              <Loader label="AI is thinking" />
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}


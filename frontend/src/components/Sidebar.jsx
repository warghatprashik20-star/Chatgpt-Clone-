import { motion } from "framer-motion";

export default function Sidebar({
  me,
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onLogout,
}) {
  return (
    <div className="flex h-full w-full flex-col border-r border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              ChatGPT Clone
            </div>
            <div className="truncate text-xs text-slate-400">
              {me?.email || "—"}
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Logout
          </button>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.99 }}
          onClick={onNewChat}
          className="mt-4 w-full rounded-2xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400"
        >
          + New chat
        </motion.button>
      </div>

      <div className="px-2 pb-3">
        <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Chats
        </div>
        <div className="space-y-1 overflow-y-auto px-2">
          {chats?.length ? (
            chats.map((c) => {
              const active = c._id === activeChatId;
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => onSelectChat?.(c._id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-slate-900 text-white ring-1 ring-inset ring-slate-800"
                      : "text-slate-300 hover:bg-slate-900/60 hover:text-white"
                  }`}
                >
                  <div className="truncate">{c.title || "Untitled chat"}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {new Date(c.updatedAt || c.createdAt).toLocaleString()}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-slate-500">
              No chats yet.
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-slate-800/80 p-4">
        <div className="text-xs text-slate-500">
          Built with React, Tailwind, Express, MongoDB, and OpenAI.
        </div>
      </div>
    </div>
  );
}


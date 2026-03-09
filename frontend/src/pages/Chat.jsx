import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import ChatInput from "../components/ChatInput.jsx";
import {
  createChat,
  getChat,
  getMe,
  listChats,
  setAuthToken,
  streamChatCompletion,
} from "../services/api.js";

function clientId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function Chat() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const streamingAssistantId = useMemo(() => {
    if (!streaming) return null;
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    return last?._id || last?.clientId || null;
  }, [messages, streaming]);

  async function refreshSidebarChats({ preserveActive = true } = {}) {
    const data = await listChats();
    setChats(data.chats || []);
    if (!preserveActive && data.chats?.[0]?._id) setActiveChatId(data.chats[0]._id);
  }

  async function loadChat(chatId) {
    setError("");
    setLoadingChat(true);
    try {
      const data = await getChat(chatId);
      setActiveChatId(data.chat._id);
      setMessages(data.chat.messages || []);
    } catch (err) {
      setError(err?.message || "Failed to load chat");
    } finally {
      setLoadingChat(false);
    }
  }

  async function ensureChatSelected(existingChats) {
    if (existingChats?.length) {
      const first = existingChats[0];
      setActiveChatId(first._id);
      await loadChat(first._id);
      return;
    }
    const created = await createChat();
    setChats([created.chat]);
    await loadChat(created.chat._id);
  }

  useEffect(() => {
    (async () => {
      try {
        const meData = await getMe();
        setMe(meData.user);
        const c = await listChats();
        setChats(c.chats || []);
        await ensureChatSelected(c.chats || []);
      } catch {
        setAuthToken(null);
        nav("/login", { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onNewChat() {
    if (streaming) abortRef.current?.abort?.();
    setError("");
    try {
      const created = await createChat();
      setChats((prev) => [created.chat, ...prev]);
      await loadChat(created.chat._id);
    } catch (err) {
      setError(err?.message || "Failed to create chat");
    }
  }

  async function onSelectChat(chatId) {
    if (streaming) abortRef.current?.abort?.();
    await loadChat(chatId);
  }

  function onLogout() {
    if (streaming) abortRef.current?.abort?.();
    setAuthToken(null);
    nav("/login", { replace: true });
  }

  async function onSend(content) {
    if (!activeChatId) return;
    setError("");

    const userMsg = { clientId: clientId(), role: "user", content };
    const assistantMsg = { clientId: clientId(), role: "assistant", content: "" };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChatCompletion({
        chatId: activeChatId,
        content,
        signal: controller.signal,
        onToken: (_chunk, full) => {
          setMessages((prev) => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i -= 1) {
              if (next[i].clientId === assistantMsg.clientId) {
                next[i] = { ...next[i], content: full };
                break;
              }
            }
            return next;
          });
        },
      });

      // Sync persisted messages + title updates
      await refreshSidebarChats();
      await loadChat(activeChatId);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "AI request failed");
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="h-full">
      <div className="grid h-full grid-cols-1 md:grid-cols-[320px_1fr]">
        <aside className="hidden h-full md:block">
          <Sidebar
            me={me}
            chats={chats}
            activeChatId={activeChatId}
            onNewChat={onNewChat}
            onSelectChat={onSelectChat}
            onLogout={onLogout}
          />
        </aside>

        <main className="flex h-full flex-col">
          <div className="border-b border-slate-800/80 bg-slate-950/60 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {chats.find((c) => c._id === activeChatId)?.title ||
                    "ChatGPT Clone"}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {me?.email || ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onNewChat}
                  className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-inset ring-slate-800 hover:bg-slate-800"
                >
                  New
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <ChatWindow
              messages={messages}
              streamingAssistantId={streamingAssistantId}
              error={loadingChat ? "Loading chat…" : error}
            />
          </div>

          <ChatInput disabled={streaming || loadingChat} onSend={onSend} />
        </main>
      </div>
    </div>
  );
}


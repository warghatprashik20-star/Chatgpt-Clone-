import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function setAuthToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export async function signup(payload) {
  const { data } = await api.post("/auth/signup", payload);
  return data;
}

export async function login(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function listChats() {
  const { data } = await api.get("/chats");
  return data;
}

export async function getChat(chatId) {
  const { data } = await api.get(`/chats/${chatId}`);
  return data;
}

export async function createChat() {
  const { data } = await api.post("/chats");
  return data;
}

export async function renameChat(chatId, title) {
  const { data } = await api.patch(`/chats/${chatId}`, { title });
  return data;
}

export async function deleteChat(chatId) {
  const { data } = await api.delete(`/chats/${chatId}`);
  return data;
}

export async function streamChatCompletion({ chatId, content, onToken, signal }) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
    signal,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      msg = j?.message || j?.error || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  if (!res.body) throw new Error("Streaming not supported in this browser.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onToken?.(chunk, full);
  }

  return full;
}


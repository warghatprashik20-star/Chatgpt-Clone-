import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup, setAuthToken } from "../services/api.js";
import { motion } from "framer-motion";

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signup({ name, email, password });
      setAuthToken(data.token);
      nav("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-full place-items-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl shadow-black/20"
      >
        <div className="text-xl font-semibold text-white">Create account</div>
        <div className="mt-1 text-sm text-slate-400">
          Get your own workspace and chat history.
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              autoComplete="name"
              required
              className="mt-1 w-full rounded-2xl border border-slate-800/80 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-2xl border border-slate-800/80 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="mt-1 w-full rounded-2xl border border-slate-800/80 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="At least 6 characters"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:opacity-60"
            type="submit"
          >
            {loading ? "Creating…" : "Create account"}
          </motion.button>
        </form>

        <div className="mt-4 text-sm text-slate-400">
          Already have an account?{" "}
          <Link className="font-semibold text-indigo-300 hover:text-indigo-200" to="/login">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}


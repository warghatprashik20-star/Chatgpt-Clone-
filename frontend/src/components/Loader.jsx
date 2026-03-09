import { motion } from "framer-motion";

export default function Loader({ label = "Thinking" }) {
  return (
    <div className="flex items-center gap-2 text-slate-300">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}


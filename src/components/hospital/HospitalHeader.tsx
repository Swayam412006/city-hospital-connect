import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface Props {
  now: Date;
}

const HospitalHeader = ({ now }: Props) => {
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong rounded-2xl px-6 py-4 flex items-center justify-between gap-6"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-[var(--shadow-glow-primary)]">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-blink" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl tracking-tight leading-none">
            City Hospital
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Emergency Command Center
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-blink" />
          <span className="text-xs font-medium text-muted-foreground">EpiGuard Link</span>
          <span className="text-xs font-semibold text-success">ONLINE</span>
        </div>
      </div>

      <div className="text-right">
        <div className="font-display text-2xl font-semibold tabular-nums">{time}</div>
        <div className="text-xs text-muted-foreground">{date}</div>
      </div>
    </motion.header>
  );
};

export default HospitalHeader;

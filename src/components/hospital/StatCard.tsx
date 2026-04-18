import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "success" | "warning" | "destructive";
  delay?: number;
}

const toneMap = {
  primary: "text-primary",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const StatCard = ({ label, value, sub, icon: Icon, tone = "primary", delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4, transition: { duration: 0.25 } }}
    className="glass-panel p-5 relative overflow-hidden group"
  >
    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
    <div className="flex items-start justify-between mb-4 relative">
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      <Icon className={`w-5 h-5 ${toneMap[tone]}`} strokeWidth={2} />
    </div>
    <div className="font-display text-3xl font-semibold tabular-nums leading-none">{value}</div>
    <div className="text-xs text-muted-foreground mt-2">{sub}</div>
  </motion.div>
);

export default StatCard;

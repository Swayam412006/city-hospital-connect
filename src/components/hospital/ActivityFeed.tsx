import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const events = [
  { time: "2 min ago", text: "Ambulance #4 dispatched to Sector 14", tone: "destructive" },
  { time: "8 min ago", text: "ER bay 3 prepared for incoming dengue case", tone: "warning" },
  { time: "14 min ago", text: "Dr. Patel acknowledged respiratory cluster alert", tone: "primary" },
  { time: "22 min ago", text: "EpiGuard escalated water-quality risk in Ward 9", tone: "primary" },
  { time: "31 min ago", text: "Vaccine cold-chain checked — temperatures nominal", tone: "success" },
  { time: "47 min ago", text: "Shift change complete — 18 staff on duty", tone: "muted-foreground" },
];

const ActivityFeed = () => (
  <div className="glass-strong rounded-2xl p-6 h-full">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
        <Activity className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h2 className="font-display font-semibold text-lg leading-tight">Activity Feed</h2>
        <p className="text-xs text-muted-foreground">Last 60 minutes</p>
      </div>
    </div>
    <ol className="relative border-l border-border/30 ml-3 space-y-5">
      {events.map((e, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="pl-5 relative"
        >
          <span className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-${e.tone} ring-4 ring-background`} />
          <div className="text-sm leading-snug">{e.text}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{e.time}</div>
        </motion.li>
      ))}
    </ol>
  </div>
);

export default ActivityFeed;

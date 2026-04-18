import { motion } from "framer-motion";
import { Ambulance, BellRing, PhoneCall, Stethoscope, Siren, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const actions = [
  { icon: Ambulance,      label: "Dispatch Ambulance", variant: "emergency" as const, msg: "Ambulance team alerted — ETA 6 min." },
  { icon: Siren,          label: "Activate Code Red",  variant: "destructive-outline" as const, msg: "Code Red activated across all wards." },
  { icon: BellRing,       label: "Notify ER Team",     variant: "primary" as const, msg: "ER team notified. 12 staff confirmed." },
  { icon: Stethoscope,    label: "Call On-Duty Doctor",variant: "glass" as const, msg: "Connecting to Dr. Sharma — line ringing…" },
  { icon: PhoneCall,      label: "Contact EpiGuard",   variant: "accent" as const, msg: "EpiGuard control received the request." },
  { icon: ClipboardList,  label: "Open Triage Log",    variant: "glass" as const, msg: "Triage log opened in secondary view." },
];

const QuickActions = () => {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg leading-tight">Quick Actions</h2>
          <p className="text-xs text-muted-foreground">One-tap response controls</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Button
              variant={a.variant}
              size="lg"
              className="w-full h-auto py-4 flex-col gap-2 text-xs"
              onClick={() => toast.success(a.msg)}
            >
              <a.icon className="w-5 h-5" />
              {a.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;

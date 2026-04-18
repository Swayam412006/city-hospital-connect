import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, MapPin, Users, Activity, Ambulance, BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Alert {
  id: string;
  disease: string;
  severity: "critical" | "high" | "moderate";
  location: string;
  cases: number;
  receivedAt: string;
  source: string;
  status: "incoming" | "acknowledged" | "dispatched";
}

interface Props {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onDispatch: (id: string) => void;
}

const severityStyles: Record<Alert["severity"], { ring: string; chip: string; text: string }> = {
  critical: {
    ring: "ring-2 ring-destructive/40",
    chip: "bg-destructive/15 text-destructive border border-destructive/30",
    text: "text-destructive",
  },
  high: {
    ring: "ring-2 ring-warning/30",
    chip: "bg-warning/15 text-warning border border-warning/30",
    text: "text-warning",
  },
  moderate: {
    ring: "",
    chip: "bg-primary/15 text-primary border border-primary/30",
    text: "text-primary",
  },
};

const EmergencyAlerts = ({ alerts, onAcknowledge, onDispatch }: Props) => {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-[hsl(var(--destructive-glow))] flex items-center justify-center">
              <BellRing className="w-5 h-5 text-destructive-foreground" />
            </div>
            <span className="absolute inset-0 rounded-xl bg-destructive animate-ping-ring" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg leading-tight">Incoming Alerts</h2>
            <p className="text-xs text-muted-foreground">Live feed from EpiGuard surveillance</p>
          </div>
        </div>
        <span className="glass rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
          {alerts.filter((a) => a.status === "incoming").length} active
        </span>
      </div>

      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 -mr-1">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => {
            const s = severityStyles[alert.severity];
            const isIncoming = alert.status === "incoming";
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: 30, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`glass-panel p-4 ${isIncoming && alert.severity === "critical" ? s.ring + " animate-pulse-emergency" : s.ring}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${s.text}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold truncate">{alert.disease}</h3>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${s.chip}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Source: {alert.source} • {alert.receivedAt}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{alert.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{alert.cases} reported cases</span>
                  </div>
                </div>

                {isIncoming ? (
                  <div className="flex gap-2">
                    <Button
                      variant="emergency"
                      size="sm"
                      className="flex-1"
                      onClick={() => onDispatch(alert.id)}
                    >
                      <Ambulance className="w-4 h-4" /> Dispatch
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      className="flex-1"
                      onClick={() => onAcknowledge(alert.id)}
                    >
                      <Check className="w-4 h-4" /> Acknowledge
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <Activity className={`w-3.5 h-3.5 ${alert.status === "dispatched" ? "text-success" : "text-primary"}`} />
                    <span className={alert.status === "dispatched" ? "text-success" : "text-primary"}>
                      {alert.status === "dispatched" ? "Ambulance dispatched" : "Acknowledged by ER"}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {alerts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No active alerts. All clear.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyAlerts;

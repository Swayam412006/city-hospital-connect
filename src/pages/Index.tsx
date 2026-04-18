import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bed, Ambulance, HeartPulse, Users, Wifi, ExternalLink } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import HospitalHeader from "@/components/hospital/HospitalHeader";
import StatCard from "@/components/hospital/StatCard";
import EmergencyAlerts, { Alert } from "@/components/hospital/EmergencyAlerts";
import QuickActions from "@/components/hospital/QuickActions";
import ActivityFeed from "@/components/hospital/ActivityFeed";
import { Button } from "@/components/ui/button";

const initialAlerts: Alert[] = [
  {
    id: "a1",
    disease: "Suspected Dengue Outbreak",
    severity: "critical",
    location: "Sector 14, East Zone",
    cases: 23,
    receivedAt: "Just now",
    source: "EpiGuard ML Engine",
    status: "incoming",
  },
  {
    id: "a2",
    disease: "Respiratory Cluster",
    severity: "high",
    location: "Greenview Apartments",
    cases: 9,
    receivedAt: "4 min ago",
    source: "Citizen Reports",
    status: "incoming",
  },
  {
    id: "a3",
    disease: "Water Contamination Risk",
    severity: "moderate",
    location: "Ward 9, North Block",
    cases: 4,
    receivedAt: "12 min ago",
    source: "EpiGuard Sensors",
    status: "acknowledged",
  },
];

const Index = () => {
  const [now, setNow] = useState(new Date());
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate an inbound emergency every 45s
  useEffect(() => {
    const samples: Omit<Alert, "id" | "receivedAt" | "status">[] = [
      { disease: "Heatstroke Surge", severity: "high", location: "Downtown Plaza", cases: 6, source: "EpiGuard Climate" },
      { disease: "Cholera Suspected", severity: "critical", location: "Riverside Camp", cases: 14, source: "EpiGuard Water" },
      { disease: "Influenza Cluster", severity: "moderate", location: "St. Mary's School", cases: 11, source: "Health Workers" },
    ];
    const t = setInterval(() => {
      const s = samples[Math.floor(Math.random() * samples.length)];
      const newAlert: Alert = {
        ...s,
        id: crypto.randomUUID(),
        receivedAt: "Just now",
        status: "incoming",
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 8));
      toast.error(`New ${s.severity.toUpperCase()} alert: ${s.disease}`, {
        description: `${s.location} • ${s.cases} cases`,
      });
    }, 45000);
    return () => clearInterval(t);
  }, []);

  const handleAcknowledge = (id: string) => {
    setAlerts((p) => p.map((a) => (a.id === id ? { ...a, status: "acknowledged" } : a)));
    toast.success("Alert acknowledged. ER team notified.");
  };
  const handleDispatch = (id: string) => {
    setAlerts((p) => p.map((a) => (a.id === id ? { ...a, status: "dispatched" } : a)));
    toast.success("Ambulance dispatched.", { description: "Crew en route. ETA 6 min." });
  };

  const incomingCount = alerts.filter((a) => a.status === "incoming").length;

  return (
    <div className="min-h-screen relative">
      {/* Background grid */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      {/* Floating orbs */}
      <div className="fixed top-20 -left-20 w-[400px] h-[400px] rounded-full bg-primary/20 blur-[120px] animate-drift pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[140px] animate-drift pointer-events-none" style={{ animationDelay: "2s" }} />

      <Toaster position="top-right" theme="dark" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <HospitalHeader now={now} />

        {/* Hero strip */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-strong rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden relative"
        >
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-muted-foreground mb-4">
              <Wifi className="w-3 h-3 text-success animate-blink" />
              Connected to EpiGuard surveillance network
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl leading-[1.1] tracking-tight">
              Emergency response, <span className="text-gradient-primary">orchestrated</span> in real time.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              City Hospital receives outbreak signals directly from EpiGuard and routes them to
              the right team — ER, ambulance dispatch, and on-call doctors — in seconds.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 relative shrink-0">
            <Button variant="primary" size="lg" asChild>
              <a href="https://epi-gaurd.vercel.app/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" /> Open EpiGuard
              </a>
            </Button>
            <Button variant="glass" size="lg">
              View Protocols
            </Button>
          </div>
        </motion.section>

        {/* Stat grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Alerts" value={incomingCount} sub="Awaiting action" icon={HeartPulse} tone="destructive" delay={0.05} />
          <StatCard label="ICU Beds Free" value={"08 / 24"} sub="33% capacity" icon={Bed} tone="primary" delay={0.1} />
          <StatCard label="Ambulances" value={"05 / 07"} sub="2 currently dispatched" icon={Ambulance} tone="accent" delay={0.15} />
          <StatCard label="Staff On Duty" value={42} sub="6 specialists available" icon={Users} tone="success" delay={0.2} />
        </section>

        {/* Main grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <EmergencyAlerts alerts={alerts} onAcknowledge={handleAcknowledge} onDispatch={handleDispatch} />
            <QuickActions />
          </div>
          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground py-6">
          City Hospital • Emergency Command Center • Integrated with{" "}
          <a href="https://epi-gaurd.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            EpiGuard
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Index;

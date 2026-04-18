import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Search, Loader2, Hospital, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface GovHospital {
  id: number;
  name: string;
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  phone?: string;
  operator?: string;
}

// Indian states + a "Whole India" option (Whole India can be slow ~10-30s)
const REGIONS: Record<string, string> = {
  "Whole India": `area["ISO3166-1"="IN"][admin_level=2]`,
  "Andhra Pradesh": `area["name"="Andhra Pradesh"][admin_level=4]`,
  "Delhi": `area["name"="Delhi"][admin_level=4]`,
  "Karnataka": `area["name"="Karnataka"][admin_level=4]`,
  "Kerala": `area["name"="Kerala"][admin_level=4]`,
  "Maharashtra": `area["name"="Maharashtra"][admin_level=4]`,
  "Tamil Nadu": `area["name"="Tamil Nadu"][admin_level=4]`,
  "Telangana": `area["name"="Telangana"][admin_level=4]`,
  "Uttar Pradesh": `area["name"="Uttar Pradesh"][admin_level=4]`,
  "West Bengal": `area["name"="West Bengal"][admin_level=4]`,
  "Gujarat": `area["name"="Gujarat"][admin_level=4]`,
  "Rajasthan": `area["name"="Rajasthan"][admin_level=4]`,
  "Punjab": `area["name"="Punjab","India"][admin_level=4]`,
  "Haryana": `area["name"="Haryana"][admin_level=4]`,
  "Madhya Pradesh": `area["name"="Madhya Pradesh"][admin_level=4]`,
  "Bihar": `area["name"="Bihar"][admin_level=4]`,
  "Odisha": `area["name"="Odisha"][admin_level=4]`,
};

const buildQuery = (regionFilter: string) => `
[out:json][timeout:60];
${regionFilter}->.searchArea;
(
  node["amenity"="hospital"]["operator:type"="government"](area.searchArea);
  way["amenity"="hospital"]["operator:type"="government"](area.searchArea);
  relation["amenity"="hospital"]["operator:type"="government"](area.searchArea);
  node["amenity"="hospital"]["operator:type"="public"](area.searchArea);
  way["amenity"="hospital"]["operator:type"="public"](area.searchArea);
);
out center tags;
`;

// Custom Leaflet marker (red medical pin via SVG)
const hospitalIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:hsl(358 85% 62%);transform:rotate(-45deg);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 12px hsl(358 85% 62% / 0.5), 0 0 0 3px hsl(0 0% 100% / 0.9);
    border:2px solid white;">
    <span style="transform:rotate(45deg);color:white;font-weight:700;font-size:14px;line-height:1;">✚</span>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const GovHospitals = () => {
  const [region, setRegion] = useState<string>("Delhi");
  const [hospitals, setHospitals] = useState<GovHospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629], // India
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO",
      maxZoom: 19,
    }).addTo(map);
    markerLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const fetchHospitals = async (regionName: string) => {
    setLoading(true);
    setHospitals([]);
    markerLayer.current?.clearLayers();
    toast.info(`Querying ${regionName}…`, { description: "OpenStreetMap data — may take 5–30s." });
    try {
      const filter = REGIONS[regionName];
      const body = buildQuery(filter);
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body,
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const data = await res.json();

      const list: GovHospital[] = (data.elements || [])
        .map((el: any) => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          if (!lat || !lon) return null;
          const t = el.tags || {};
          return {
            id: el.id,
            name: t.name || t["name:en"] || "Unnamed Government Hospital",
            lat,
            lon,
            city: t["addr:city"] || t["addr:suburb"],
            state: t["addr:state"],
            phone: t.phone || t["contact:phone"],
            operator: t.operator,
          } as GovHospital;
        })
        .filter(Boolean) as GovHospital[];

      setHospitals(list);
      toast.success(`Found ${list.length} government hospitals`);

      // Plot markers
      if (markerLayer.current && mapInstance.current && list.length > 0) {
        const bounds: [number, number][] = [];
        list.forEach((h) => {
          const m = L.marker([h.lat, h.lon], { icon: hospitalIcon });
          m.bindPopup(
            `<div style="font-family:Inter,sans-serif;color:#0b1220;min-width:200px">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${h.name}</div>
              ${h.city ? `<div style="font-size:12px;color:#475569">${h.city}${h.state ? ", " + h.state : ""}</div>` : ""}
              ${h.phone ? `<div style="font-size:12px;margin-top:4px">📞 ${h.phone}</div>` : ""}
              ${h.operator ? `<div style="font-size:11px;color:#64748b;margin-top:4px">${h.operator}</div>` : ""}
            </div>`
          );
          markerLayer.current!.addLayer(m);
          bounds.push([h.lat, h.lon]);
        });
        mapInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch hospitals", { description: "Overpass API may be busy. Try again." });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchHospitals(region);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.state?.toLowerCase().includes(q)
    );
  }, [hospitals, search]);

  const focusHospital = (h: GovHospital) => {
    mapInstance.current?.flyTo([h.lat, h.lon], 15, { duration: 1.2 });
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed top-20 -left-20 w-[400px] h-[400px] rounded-full bg-primary/20 blur-[120px] animate-drift pointer-events-none" />
      <Toaster position="top-right" theme="dark" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-4">
            <Button variant="glass" size="icon" asChild>
              <Link to="/"><ArrowLeft className="w-4 h-4" /></Link>
            </Button>
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
                Government Hospitals <span className="text-gradient-primary">Directory</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Live data from OpenStreetMap • {hospitals.length} hospitals loaded
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => fetchHospitals(region)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </Button>
        </motion.div>

        {/* Controls */}
        <div className="glass-strong rounded-2xl p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, state…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input/40 border-white/10"
            />
          </div>
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              fetchHospitals(e.target.value);
            }}
            disabled={loading}
            className="glass rounded-xl px-4 py-2 text-sm bg-input/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-ring min-w-[200px]"
          >
            {Object.keys(REGIONS).map((r) => (
              <option key={r} value={r} className="bg-card text-foreground">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Map + List */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 glass-strong rounded-2xl overflow-hidden h-[600px] relative">
            {loading && (
              <div className="absolute inset-0 z-[400] bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex items-center gap-3 glass rounded-xl px-5 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm">Loading {region}…</span>
                </div>
              </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
          </div>

          {/* List */}
          <div className="lg:col-span-2 glass-strong rounded-2xl p-4 h-[600px] flex flex-col">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Hospital className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold">
                {filtered.length} {search ? "matching" : "hospitals"}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filtered.length === 0 && !loading && (
                <div className="text-center text-muted-foreground py-10 text-sm">
                  No hospitals found.
                </div>
              )}
              {filtered.map((h) => (
                <button
                  key={h.id}
                  onClick={() => focusHospital(h)}
                  className="w-full text-left glass rounded-xl p-3 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {h.name}
                      </div>
                      {(h.city || h.state) && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {[h.city, h.state].filter(Boolean).join(", ")}
                        </div>
                      )}
                      {h.phone && (
                        <div className="text-xs text-success mt-1">📞 {h.phone}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Data: <a className="text-primary hover:underline" href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors via Overpass API. Coverage varies by region.
        </p>
      </div>
    </div>
  );
};

export default GovHospitals;

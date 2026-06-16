import { useState } from "react";
import { IconMapPin, IconTruck } from "../../components/Icons";

const routes = [
  { id: "R-401", driver: "Budi Santoso",  stops: 4, status: "Active", area: "North Jakarta" },
  { id: "R-402", driver: "Andi Wijaya",   stops: 3, status: "Active", area: "East Jakarta" },
  { id: "R-403", driver: "Citra Lestari", stops: 5, status: "Idle",   area: "South Jakarta" },
];

export default function LogisticsPage() {
  const [selected, setSelected] = useState(routes[0].id);

  return (
    <div className="px-12 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-3xl font-semibold text-[#1B1C1C]">Logistics Dashboard</h1>
        <button className="bg-[#725A39] hover:bg-[#5B4526] text-white px-5 py-2.5 rounded-sm text-sm font-body font-bold transition-colors">
          + New Inspection
        </button>
      </div>
      <p className="font-sans text-base text-[#4D453C] mb-8">Kelola dan pantau rute pickup &amp; pengiriman secara aktif.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-5">
          <div className="font-serif text-2xl font-semibold text-[#1B1C1C]">12</div>
          <div className="font-body text-xs text-[#4D453C]">Active Routes</div>
        </div>
        <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-5">
          <div className="font-serif text-2xl font-semibold text-[#1B1C1C]">47</div>
          <div className="font-body text-xs text-[#4D453C]">Stops Today</div>
        </div>
        <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-5">
          <div className="font-serif text-2xl font-semibold text-[#1B1C1C]">8</div>
          <div className="font-body text-xs text-[#4D453C]">Drivers On Duty</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="font-body text-sm font-bold text-[#1B1C1C]">Live Tracking Map</span>
            <span className="font-body text-xs text-[#4D453C]">Route {selected}</span>
          </div>
          <div className="relative bg-[#E4E2E1] rounded-sm h-80 overflow-hidden">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              <path d="M40 240 Q 100 200 140 160 T 240 100 Q 280 80 360 60" fill="none" stroke="#725A39" strokeWidth="3" strokeDasharray="6 4" />
              <circle cx="40" cy="240" r="7" fill="#1B1C1C" />
              <circle cx="140" cy="160" r="6" fill="#4D453C" />
              <circle cx="240" cy="100" r="6" fill="#4D453C" />
              <circle cx="360" cy="60" r="8" fill="#725A39" />
            </svg>
            <div className="absolute top-4 left-4 bg-white rounded-sm px-3 py-1.5 shadow text-xs font-body font-bold text-[#1B1C1C] flex items-center gap-1.5">
              <IconTruck className="w-3.5 h-3.5 text-[#725A39]" /> Start: Gudang Jakarta
            </div>
            <div className="absolute bottom-4 right-4 bg-white rounded-sm px-3 py-1.5 shadow text-xs font-body font-bold text-[#1B1C1C] flex items-center gap-1.5">
              <IconMapPin className="w-3.5 h-3.5 text-[#725A39]" /> Next: Kebayoran Baru
            </div>
          </div>
        </div>

        <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-5">
          <h2 className="font-body font-bold text-[#1B1C1C] mb-4 text-sm">Active Routes</h2>
          <div className="space-y-2">
            {routes.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`w-full text-left rounded-sm p-3 border transition-colors ${
                  selected === r.id ? "bg-[#1B1C1C] border-[#1B1C1C] text-white" : "bg-white border-[#D1C5B8] hover:border-[#725A39]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-body font-bold text-sm">{r.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-sm ${
                    r.status === "Active"
                      ? selected === r.id ? "bg-[#D2B48C] text-[#5B4526]" : "bg-green-100 text-green-700"
                      : selected === r.id ? "bg-[#4D453C] text-[#D1C5B8]" : "bg-[#E4E2E1] text-[#4D453C]"
                  }`}>
                    {r.status}
                  </span>
                </div>
                <div className={`font-body text-xs mt-1 ${selected === r.id ? "text-[#D1C5B8]" : "text-[#4D453C]"}`}>{r.driver} · {r.area}</div>
                <div className={`font-body text-xs mt-0.5 ${selected === r.id ? "text-[#A89070]" : "text-[#7F766A]"}`}>{r.stops} stops</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

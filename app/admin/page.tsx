import { IconSearch, IconTruck, IconWallet } from "../components/Icons";

const priorityQueue = [
  { name: "MacBook Pro 16\" (2021)", id: "#PT-INV-3021", status: "Submitted", level: "neutral" as const },
  { name: "iPhone 13 Pro",            id: "#PT-INV-3022", status: "Urgent",    level: "urgent"  as const },
  { name: "Sony WH-1000XM4",          id: "#PT-INV-3023", status: "In Review", level: "neutral" as const },
];

const dispatch = [
  { time: "DISPATCH SCHEDULED - 14:00", route: "Route North-A (12 Items)", driver: "Driver: M. Rahman · Vehicle: B 1234 CD", active: true },
  { time: "LOADING - 16:30",            route: "Route Central-C (8 Items)", driver: "", active: false },
];

const verificationYield = [
  { label: "Mint Condition", pct: 45, color: "#1B1C1C" },
  { label: "Good Condition", pct: 35, color: "#D2B48C" },
  { label: "Fair Condition", pct: 15, color: "#E8E2D9" },
  { label: "Rejected",       pct: 5,  color: "#BA1A1A" },
];

export default function AdminOverviewPage() {
  return (
    <div className="px-12 py-10 max-w-5xl">
      <div className="flex items-center justify-between border-b border-[#D1C5B8] pb-3 mb-10">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1B1C1C]">Operations Overview</h1>
          <p className="font-sans text-base text-[#4D453C]">Real-time status of managed logistics and verified inventory.</p>
        </div>
        <div className="text-right">
          <div className="font-body text-xs font-bold text-[#4D453C]">DATE</div>
          <div className="font-body text-sm font-bold text-[#1B1C1C]">Oct 24, 2024</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-body text-xs font-bold text-[#4D453C] tracking-wide">QC QUEUE</span>
            <IconSearch className="w-4 h-4 text-[#7F766A]" />
          </div>
          <div className="font-serif text-5xl font-semibold text-[#1B1C1C] mb-1">42</div>
          <div className="flex items-center gap-1 text-sm">
            <span className="font-body font-bold text-[#BA1A1A]">↑ 12</span>
            <span className="font-body text-[#4D453C]">from yesterday</span>
          </div>
        </div>

        <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-body text-xs font-bold text-[#4D453C] tracking-wide">PENDING DISPATCH</span>
            <IconTruck className="w-4 h-4 text-[#7F766A]" />
          </div>
          <div className="font-serif text-5xl font-semibold text-[#1B1C1C] mb-1">18</div>
          <div className="flex items-center gap-1 text-sm">
            <span className="font-body font-bold text-[#615E57]">↓ 3</span>
            <span className="font-body text-[#4D453C]">from yesterday</span>
          </div>
        </div>

        <div className="bg-[#D2B48C] border border-[#E1C299] rounded-lg p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="font-body text-xs font-bold text-[#5B4526] tracking-wide">WEEKLY CLEARANCE VALUE</span>
            <IconWallet className="w-4 h-4 text-[#5B4526]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="font-serif text-4xl font-semibold text-[#5B4526]">$124,500</div>
            <button className="border border-[#5B4526] text-[#5B4526] font-body text-sm font-medium px-3 py-1.5 rounded-sm">
              View Financials
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-6">
            <div className="flex justify-between items-center border-b border-[#D1C5B8] pb-3 mb-4">
              <h2 className="font-serif text-2xl font-medium text-[#1B1C1C]">Priority Inspection Queue</h2>
              <button className="font-body text-sm font-bold text-[#725A39]">View All</button>
            </div>
            <div className="flex flex-col gap-3">
              {priorityQueue.map((q) => (
                <div key={q.id} className="bg-[#F6F3F2] border border-[#D1C5B8] rounded-sm p-3 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-[#E1DFDC] rounded-sm flex-shrink-0" />
                    <div>
                      <div className="font-body text-sm font-bold text-[#1B1C1C]">{q.name}</div>
                      <div className="font-body text-xs text-[#4D453C]">{q.id}</div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-sm border ${
                      q.level === "urgent" ? "bg-[#FFDAD6] border-[#FFDAD6] text-[#BA1A1A]" : "bg-[#E4E2E1] border-[#D1C5B8] text-[#1B1C1C]"
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-6">
            <h2 className="font-serif text-2xl font-medium text-[#1B1C1C] border-b border-[#D1C5B8] pb-3 mb-4">Logistics Dispatch</h2>
            <div className="flex flex-col gap-6 pl-4 border-l border-[#D1C5B8]">
              {dispatch.map((d) => (
                <div key={d.route} className="relative">
                  <span
                    className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-[#FBF9F8] ${
                      d.active ? "bg-[#725A39]" : "bg-[#E4E2E1]"
                    }`}
                  />
                  <div className="font-body text-xs font-bold text-[#4D453C] mb-0.5">{d.time}</div>
                  <div className="font-body text-sm font-bold text-[#1B1C1C]">{d.route}</div>
                  {d.driver && <div className="font-body text-sm text-[#4D453C]">{d.driver}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#F6F3F2] border border-[#D1C5B8] rounded-lg p-6">
            <h2 className="font-serif text-2xl font-medium text-[#1B1C1C] mb-4">Daily Verification Yield</h2>
            <div className="flex flex-col gap-4">
              {verificationYield.map((v) => (
                <div key={v.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-body text-[#1B1C1C]">{v.label}</span>
                    <span className="font-body font-bold text-[#1B1C1C]">{v.pct}%</span>
                  </div>
                  <div className="h-2 bg-[#E4E2E1] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${v.pct}%`, backgroundColor: v.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-6">
            <h2 className="font-serif text-2xl font-medium text-[#1B1C1C] mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              {["Generate Manifest", "Audit Log", "Contact Fleet Manager"].map((a) => (
                <button key={a} className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-sm px-4 py-2.5 text-sm font-body font-medium text-[#1B1C1C] text-left hover:bg-white transition-colors">
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

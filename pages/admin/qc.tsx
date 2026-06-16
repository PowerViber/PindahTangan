import { IconClock, IconBox, IconCheck } from "../../components/Icons";

const stats = [
  { label: "AVG INSPECTION TIME", value: "14m 30s", bg: "#D2B48C", iconColor: "#5B4526", Icon: IconClock },
  { label: "PASS RATE (TODAY)",   value: "92.4%",    bg: "#BDB8B0", iconColor: "#4C4942", Icon: IconCheck },
  { label: "AWAITING QC",         value: "24 Items", bg: "#EAE8E7", iconColor: "#1B1C1C", Icon: IconBox },
];

const queue = [
  { name: "Apple Watch Series 7 - 45mm GPS",          condition: "Good", waiting: "2h ago" },
  { name: "Sony WH-1000XM4 Wireless Headphones",      condition: "Mint", waiting: "3.5h ago" },
  { name: "Dell XPS 13 (2022) - 16GB RAM",            condition: "Fair", waiting: "5h ago" },
];

export default function QCQueuePage() {
  return (
    <div className="px-20 py-20 max-w-4xl">
      <div className="flex flex-col gap-6 mb-14">
        <h1 className="font-serif text-3xl font-semibold text-[#1B1C1C]">Quality Control Queue</h1>
        <div className="grid sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-6 flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.bg }}>
                <s.Icon className="w-5 h-5" style={{ color: s.iconColor }} />
              </div>
              <div>
                <div className="font-body text-xs font-bold text-[#4D453C] tracking-wide">{s.label}</div>
                <div className="font-body text-2xl font-bold text-[#1B1C1C]">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-medium text-[#1B1C1C]">Awaiting Inspection</h2>
          <div className="flex gap-3">
            <button className="border border-[#7F766A] rounded-sm px-3 py-1.5 text-sm font-body font-medium text-[#1B1C1C]">Filter</button>
            <button className="border border-[#7F766A] rounded-sm px-3 py-1.5 text-sm font-body font-medium text-[#1B1C1C]">Sort: Oldest First</button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {queue.map((q) => (
            <div key={q.name} className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-3 flex items-center gap-6">
              <div className="w-24 h-24 bg-[#E4E2E1] rounded-sm flex-shrink-0" />
              <div className="flex-1">
                <div className="bg-[#EAE8E7] rounded-sm px-2 py-1 w-fit mb-1">
                  <span className="font-body text-xs font-medium text-[#4D453C]">{q.condition}</span>
                </div>
                <h3 className="font-body text-lg font-medium text-[#1B1C1C]">{q.name}</h3>
                <p className="font-body text-sm text-[#4D453C]">Expected Condition: {q.condition}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 text-[#4D453C]">
                  <IconClock className="w-3.5 h-3.5" />
                  <span className="font-body text-sm">{q.waiting}</span>
                </div>
                <button className="bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-bold text-sm px-6 py-2 rounded-sm transition-colors">
                  Start Inspection
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <button className="border border-[#7F766A] rounded-sm px-12 py-2 text-sm font-body font-medium text-[#1B1C1C]">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}

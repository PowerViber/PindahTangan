import { IconClock } from "../../components/Icons";

const stats = [
  { label: "GROSS REVENUE",  value: "$482,900", deltaBg: "#FEDDB3" },
  { label: "AVERAGE MARGIN", value: "28.4%",     deltaBg: "#FEDDB3" },
  { label: "GROWTH RATE",    value: "8.7%",      deltaBg: "#FFDAD6" },
];

const revenueTrend = [320, 360, 340, 400, 430, 410, 460, 482];

const conditionGrade = [
  { label: "Mint",  pct: 45, color: "#1B1C1C" },
  { label: "Good",  pct: 35, color: "#D2B48C" },
  { label: "Fair",  pct: 20, color: "#E8E2D9" },
];

const turnover = [
  { month: "JAN", listed: 100, sold: 88  },
  { month: "FEB", listed: 151, sold: 126 },
  { month: "MAR", listed: 113, sold: 163 },
  { month: "APR", listed: 201, sold: 176 },
  { month: "MAY", listed: 138, sold: 213 },
  { month: "JUN", listed: 226, sold: 238 },
];

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...revenueTrend);
  const maxUnits = Math.max(...turnover.flatMap((t) => [t.listed, t.sold]));
  let cumulative = 0;

  return (
    <div className="px-12 py-10 max-w-5xl">
      <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-6 mb-10">
        <div>
          <h1 className="font-serif text-5xl font-semibold text-[#1B1C1C] mb-2">Performance Analytics</h1>
          <p className="font-sans text-base text-[#4D453C]">Monitoring ecosystem health and logistics throughput.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#FBF9F8] border border-[#D1C5B8] rounded-sm px-4 py-2.5">
            <IconClock className="w-3.5 h-3.5 text-[#4D453C]" />
            <span className="font-body text-sm font-medium text-[#1B1C1C]">Last 30 Days</span>
          </button>
          <button className="border border-[#7F766A] rounded-sm px-4 py-2.5 text-xs font-body font-bold text-[#1B1C1C]">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#FBF9F8] border border-[#E8E2D9] rounded-lg p-6">
            <div className="font-body text-xs font-bold text-[#4D453C] tracking-wide mb-3">{s.label}</div>
            <div className="flex items-end gap-2">
              <span className="font-sans text-4xl font-semibold text-[#1B1C1C]">{s.value}</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: s.deltaBg }}>▲</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5 mb-8">
        <div className="bg-[#FBF9F8] border border-[#E8E2D9] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-xl font-semibold text-[#1B1C1C]">Revenue Trends</h2>
            <span className="border border-[#D1C5B8] rounded-full px-3 py-1 text-xs font-body text-[#4D453C]">6 Months</span>
          </div>
          <div className="flex items-end gap-3 h-56">
            {revenueTrend.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-sm ${i === revenueTrend.length - 1 ? "bg-[#725A39]" : "bg-[#E8E2D9]"}`}
                  style={{ height: `${(v / maxRevenue) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#FBF9F8] border border-[#E8E2D9] rounded-lg p-6">
          <h2 className="font-serif text-xl font-semibold text-[#1B1C1C] mb-6">Condition Grade</h2>
          <div className="flex flex-col gap-3 mb-6">
            {conditionGrade.map((g) => (
              <div key={g.label} className="flex justify-between text-sm">
                <span className="font-body text-[#1B1C1C]">{g.label}</span>
                <span className="font-body font-bold text-[#1B1C1C]">{g.pct}%</span>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 42 42" className="w-32 h-32 mx-auto">
            {conditionGrade.map((g) => {
              const dash = (g.pct / 100) * 100;
              const offset = cumulative;
              cumulative += dash;
              return (
                <circle
                  key={g.label}
                  cx="21" cy="21" r="15.9"
                  fill="transparent"
                  stroke={g.color}
                  strokeWidth="6"
                  strokeDasharray={`${dash} ${100 - dash}`}
                  strokeDashoffset={`${25 - offset}`}
                  transform="rotate(-90 21 21)"
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="bg-[#FBF9F8] border border-[#E8E2D9] rounded-lg p-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="font-serif text-xl font-semibold text-[#1B1C1C]">Inventory Turnover (Units)</h2>
          <div className="flex gap-4 text-xs font-body text-[#4D453C]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D2B48C]" /> Listed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1B1C1C]" /> Sold</span>
          </div>
        </div>
        <div className="flex items-end gap-6 h-64 border-b border-[#E8E2D9] pb-2">
          {turnover.map((t) => (
            <div key={t.month} className="flex-1 flex items-end justify-center gap-1">
              <div className="w-12 rounded-t-sm bg-[#D2B48C]" style={{ height: `${(t.listed / maxUnits) * 100}%` }} />
              <div className="w-12 rounded-t-sm bg-[#1B1C1C]" style={{ height: `${(t.sold / maxUnits) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-3">
          {turnover.map((t) => (
            <div key={t.month} className="flex-1 text-center font-body text-xs font-bold text-[#4D453C]">{t.month}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

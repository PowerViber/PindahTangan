import { useEffect, useState } from "react";
import Link from "next/link";
import { IconClock, IconBox, IconCheck } from "../../components/Icons";
import { supabase } from "../../lib/supabase";

const stats = [
  { label: "AVG INSPECTION TIME", value: "14m 30s", bg: "#D2B48C", iconColor: "#5B4526", Icon: IconClock },
  { label: "PASS RATE (TODAY)",   value: "92.4%",    bg: "#BDB8B0", iconColor: "#4C4942", Icon: IconCheck },
];

interface Submission {
  id: string;
  product_name: string;
  condition: string;
  image_url?: string | null;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function QCQueuePage() {
  const [queue, setQueue] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      setLoading(true);
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("status", "PENDING")
        .order("created_at", { ascending: true });

      if (!error && data) {
        setQueue(data);
      }
      setLoading(false);
    }
    loadQueue();
  }, []);

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
          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-6 flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EAE8E7" }}>
              <IconBox className="w-5 h-5" style={{ color: "#1B1C1C" }} />
            </div>
            <div>
              <div className="font-body text-xs font-bold text-[#4D453C] tracking-wide">AWAITING QC</div>
              <div className="font-body text-2xl font-bold text-[#1B1C1C]">{loading ? "..." : `${queue.length} Items`}</div>
            </div>
          </div>
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

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : queue.length === 0 ? (
          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-12 text-center font-body text-sm text-[#7F766A]">
            Tidak ada barang yang menunggu inspeksi.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {queue.map((q) => (
              <div key={q.id} className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-3 flex items-center gap-6">
                {q.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={q.image_url} alt={q.product_name} className="w-24 h-24 object-cover rounded-sm flex-shrink-0" />
                ) : (
                  <div className="w-24 h-24 bg-[#E4E2E1] rounded-sm flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="bg-[#EAE8E7] rounded-sm px-2 py-1 w-fit mb-1">
                    <span className="font-body text-xs font-medium text-[#4D453C]">{q.condition || "N/A"}</span>
                  </div>
                  <h3 className="font-body text-lg font-medium text-[#1B1C1C]">{q.product_name}</h3>
                  <p className="font-body text-sm text-[#4D453C]">Expected Condition: {q.condition || "N/A"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-[#4D453C]">
                    <IconClock className="w-3.5 h-3.5" />
                    <span className="font-body text-sm">{timeAgo(q.created_at)}</span>
                  </div>
                  <Link
                    href={`/admin/qc/${q.id}`}
                    className="bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-bold text-sm px-6 py-2 rounded-sm transition-colors"
                  >
                    Start Inspection
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

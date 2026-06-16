import { useEffect, useState } from "react";
import { IconSearch, IconTruck, IconWallet } from "../components/Icons";
import { supabase } from "../lib/supabase";
import { formatIDR } from "../components/ProductCard";

interface Submission {
  id: string;
  product_name: string;
  status: string;
  estimation_price: number;
  created_at: string;
}

const dispatch = [
  { time: "DISPATCH SCHEDULED - 14:00", route: "Rute Jakarta Selatan-A (12 Items)", driver: "Driver: M. Rahman · Vehicle: B 1234 CD", active: true },
  { time: "LOADING - 16:30",            route: "Rute Jakarta Pusat-C (8 Items)", driver: "", active: false },
];

const verificationYield = [
  { label: "Mulus (Mint)", pct: 45, color: "#1B1C1C" },
  { label: "Bagus (Good)", pct: 35, color: "#D2B48C" },
  { label: "Cukup (Fair)", pct: 15, color: "#E8E2D9" },
  { label: "Ditolak (Rejected)",       pct: 5,  color: "#BA1A1A" },
];

export default function AdminOverviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [qcCount, setQcCount] = useState(0);
  const [dispatchCount, setDispatchCount] = useState(0);
  const [clearanceValue, setClearanceValue] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSubmissions(data);

        const pending = data.filter((s) => s.status === "PENDING").length;
        setQcCount(pending);

        const active = data.filter((s) => s.status === "ACTIVE").length;
        setDispatchCount(active);

        const val = data
          .filter((s) => s.status === "ACTIVE" || s.status === "SOLD")
          .reduce((sum, s) => sum + (Number(s.estimation_price) || 0), 0);
        setClearanceValue(val);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();

    const interval = setInterval(() => {
      loadAdminData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const priorityQueue = submissions.slice(0, 5);

  return (
    <div className="px-6 sm:px-12 py-10 max-w-5xl flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D1C5B8] pb-4 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1B1C1C]">Operations Overview</h1>
          <p className="font-sans text-sm text-[#4D453C]">Status waktu-nyata logistik terkelola dan inventori terverifikasi.</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="font-body text-xs font-bold text-[#4D453C] tracking-wider uppercase">TANGGAL</div>
          <div className="font-body text-sm font-bold text-[#1B1C1C]">
            {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-xl p-6 shadow-xs flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <span className="font-body text-xs font-bold text-[#4D453C] tracking-wider uppercase">QC QUEUE</span>
            <IconSearch className="w-4 h-4 text-[#7F766A]" />
          </div>
          <div>
            <div className="font-serif text-4xl sm:text-5xl font-bold text-[#1B1C1C] mb-1">
              {loading ? "..." : qcCount}
            </div>
            <div className="text-xs text-[#7F766A] font-sans">Barang menunggu pemeriksaan masuk</div>
          </div>
        </div>

        <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-xl p-6 shadow-xs flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <span className="font-body text-xs font-bold text-[#4D453C] tracking-wider uppercase">PENDING DISPATCH</span>
            <IconTruck className="w-4 h-4 text-[#7F766A]" />
          </div>
          <div>
            <div className="font-serif text-4xl sm:text-5xl font-bold text-[#1B1C1C] mb-1">
              {loading ? "..." : dispatchCount}
            </div>
            <div className="text-xs text-[#7F766A] font-sans">Barang siap dikirim / listing aktif</div>
          </div>
        </div>

        <div className="bg-[#D2B48C] border border-[#E1C299] rounded-xl p-6 shadow-xs flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <span className="font-body text-xs font-bold text-[#5B4526] tracking-wider uppercase">WEEKLY CLEARANCE VALUE</span>
            <IconWallet className="w-4 h-4 text-[#5B4526]" />
          </div>
          <div>
            <div className="font-serif text-3xl font-bold text-[#5B4526] mb-2">
              {loading ? "..." : formatIDR(clearanceValue)}
            </div>
            <button className="border border-[#5B4526] text-[#5B4526] font-body text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
              Lihat Keuangan
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="flex flex-col gap-6">
          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#D1C5B8] pb-3">
              <h2 className="font-serif text-xl font-bold text-[#1B1C1C]">Antrean QC Terbaru (Priority Queue)</h2>
              <button className="font-body text-xs font-bold text-[#725A39] hover:underline cursor-pointer">Segarkan</button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : priorityQueue.length > 0 ? (
              <div className="flex flex-col gap-3">
                {priorityQueue.map((q) => (
                  <div key={q.id} className="bg-[#F6F3F2] border border-[#D1C5B8] rounded-lg p-4 flex items-center justify-between hover:border-[#725A39] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#E1DFDC] rounded-lg flex items-center justify-center text-[#7F766A] font-bold text-sm shadow-2xs">
                        {q.product_name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-body text-sm font-bold text-[#1B1C1C] line-clamp-1">{q.product_name}</div>
                        <div className="font-mono text-[10px] text-[#7F766A]">
                          IDR: {formatIDR(q.estimation_price)}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                        q.status === "PENDING"
                          ? "bg-[#FEDDB3] border-[#725A39]/30 text-[#725A39]"
                          : q.status === "ACTIVE"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-[#E4E2E1] border-[#D1C5B8] text-[#1B1C1C]"
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 font-sans text-sm text-[#7F766A]">
                Belum ada pengajuan masuk.
              </div>
            )}
          </div>

          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-xl p-6 shadow-xs">
            <h2 className="font-serif text-xl font-bold text-[#1B1C1C] border-b border-[#D1C5B8] pb-3 mb-4">Logistics Dispatch</h2>
            <div className="flex flex-col gap-6 pl-4 border-l border-[#D1C5B8]">
              {dispatch.map((d) => (
                <div key={d.route} className="relative">
                  <span
                    className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-[#FBF9F8] ${
                      d.active ? "bg-[#725A39]" : "bg-[#E4E2E1]"
                    }`}
                  />
                  <div className="font-body text-xs font-bold text-[#7F766A] mb-0.5">{d.time}</div>
                  <div className="font-body text-sm font-bold text-[#1B1C1C]">{d.route}</div>
                  {d.driver && <div className="font-body text-xs text-[#4D453C] mt-0.5">{d.driver}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#F6F3F2] border border-[#D1C5B8] rounded-xl p-6 shadow-xs">
            <h2 className="font-serif text-xl font-bold text-[#1B1C1C] mb-4">Hasil Verifikasi Harian</h2>
            <div className="flex flex-col gap-4">
              {verificationYield.map((v) => (
                <div key={v.label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="font-body text-[#1B1C1C]">{v.label}</span>
                    <span className="font-body text-[#1B1C1C]">{v.pct}%</span>
                  </div>
                  <div className="h-2 bg-[#E4E2E1] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${v.pct}%`, backgroundColor: v.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-xl p-6 shadow-xs">
            <h2 className="font-serif text-xl font-bold text-[#1B1C1C] mb-4">Tindakan Cepat</h2>
            <div className="flex flex-col gap-3">
              {["Generate Manifest", "Audit Log", "Hubungi Driver Fleet"].map((a) => (
                <button key={a} className="bg-[#FBF9F8] border border-[#D1C5B8] hover:border-[#725A39] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1B1C1C] text-left hover:bg-white transition-all cursor-pointer shadow-2xs">
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

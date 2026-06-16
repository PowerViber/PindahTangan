import { useEffect, useState } from "react";
import Link from "next/link";
import { IconSearch, IconTruck, IconWallet } from "../components/Icons";
import { supabase } from "../lib/supabase";
import { formatIDR } from "../components/ProductCard";

interface Submission {
  id: string;
  product_name: string;
  status: string;
  estimation_price: number;
  created_at: string;
  pickup_date?: string | null;
  pickup_time?: string | null;
  address?: string;
}

export default function AdminOverviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [qcCount, setQcCount] = useState(0);
  const [dispatchCount, setDispatchCount] = useState(0);
  const [clearanceValue, setClearanceValue] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    try {
      const [subRes, prodRes] = await Promise.all([
        supabase
          .from("submissions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("products").select("*"),
      ]);

      const data = subRes.data || [];
      const prods = prodRes.data || [];
      setSubmissions(data);
      setProducts(prods);

      setQcCount(data.filter((s) => s.status === "PENDING").length);
      setDispatchCount(data.filter((s) => s.status === "ACTIVE").length);

      const val = data
        .filter((s) => s.status === "ACTIVE" || s.status === "SOLD")
        .reduce((sum, s) => sum + (Number(s.estimation_price) || 0), 0);
      const prodVal = prods.reduce((sum: number, p: any) => sum + (Number(p.price) || 0), 0);
      setClearanceValue(val + prodVal);
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

  // QC queue: only show non-ACTIVE, non-SOLD, non-DRAFT submissions (i.e. PENDING items needing inspection)
  const qcQueue = submissions.filter(
    (s) => s.status === "PENDING"
  ).slice(0, 5);

  // Logistics dispatch: submissions that have pickup_date set and are PENDING
  const scheduledPickups = submissions
    .filter((s) => s.status === "PENDING" && s.pickup_date)
    .slice(0, 4);

  // Verification yield from real data
  const totalProcessed = submissions.filter((s) => s.status !== "DRAFT").length;
  const activeCount = submissions.filter((s) => s.status === "ACTIVE").length;
  const soldCount = submissions.filter((s) => s.status === "SOLD").length;
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const cancelledCount = submissions.filter((s) => s.status === "CANCELLED").length;

  function pct(count: number) {
    return totalProcessed > 0 ? Math.round((count / totalProcessed) * 100) : 0;
  }

  const verificationYield = [
    { label: "Active (Listed)", pct: pct(activeCount), color: "#1B1C1C" },
    { label: "Sold", pct: pct(soldCount), color: "#D2B48C" },
    { label: "Pending QC", pct: pct(pendingCount), color: "#E8E2D9" },
    { label: "Cancelled / Rejected", pct: pct(cancelledCount), color: "#BA1A1A" },
  ];

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
            <span className="font-body text-xs font-bold text-[#4D453C] tracking-wider uppercase">PRODUCTS IN STORE</span>
            <IconTruck className="w-4 h-4 text-[#7F766A]" />
          </div>
          <div>
            <div className="font-serif text-4xl sm:text-5xl font-bold text-[#1B1C1C] mb-1">
              {loading ? "..." : products.length}
            </div>
            <div className="text-xs text-[#7F766A] font-sans">Total produk di marketplace</div>
          </div>
        </div>

        <div className="bg-[#D2B48C] border border-[#E1C299] rounded-xl p-6 shadow-xs flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <span className="font-body text-xs font-bold text-[#5B4526] tracking-wider uppercase">TOTAL ASSET VALUE</span>
            <IconWallet className="w-4 h-4 text-[#5B4526]" />
          </div>
          <div>
            <div className="font-serif text-3xl font-bold text-[#5B4526] mb-2">
              {loading ? "..." : formatIDR(clearanceValue)}
            </div>
            <Link
              href="/admin/analytics"
              className="border border-[#5B4526] text-[#5B4526] font-body text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            >
              Lihat Analytics
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="flex flex-col gap-6">
          {/* QC Queue - links to individual QC pages */}
          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#D1C5B8] pb-3">
              <h2 className="font-serif text-xl font-bold text-[#1B1C1C]">Antrean QC Terbaru</h2>
              <Link href="/admin/qc" className="font-body text-xs font-bold text-[#725A39] hover:underline cursor-pointer">
                Lihat Semua
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : qcQueue.length > 0 ? (
              <div className="flex flex-col gap-3">
                {qcQueue.map((q) => (
                  <Link
                    key={q.id}
                    href={`/admin/qc/${q.id}`}
                    className="bg-[#F6F3F2] border border-[#D1C5B8] rounded-lg p-4 flex items-center justify-between hover:border-[#725A39] hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#E1DFDC] rounded-lg flex items-center justify-center text-[#7F766A] font-bold text-sm shadow-2xs">
                        {q.product_name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-body text-sm font-bold text-[#1B1C1C] line-clamp-1">{q.product_name}</div>
                        <div className="font-mono text-[10px] text-[#7F766A]">
                          Est: {formatIDR(q.estimation_price)} · {new Date(q.created_at).toLocaleDateString("id-ID")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#FEDDB3] border-[#725A39]/30 text-[#725A39] text-xs font-bold px-3 py-1.5 rounded-full border">
                        PENDING
                      </span>
                      <svg className="w-4 h-4 text-[#7F766A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 font-sans text-sm text-[#7F766A]">
                Belum ada pengajuan yang menunggu QC.
              </div>
            )}
          </div>

          {/* Logistics Dispatch - from real pickup schedule data */}
          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-xl p-6 shadow-xs">
            <div className="flex justify-between items-center border-b border-[#D1C5B8] pb-3 mb-4">
              <h2 className="font-serif text-xl font-bold text-[#1B1C1C]">Jadwal Penjemputan</h2>
              <Link href="/admin/logistics" className="font-body text-xs font-bold text-[#725A39] hover:underline cursor-pointer">
                Lihat Semua
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : scheduledPickups.length > 0 ? (
              <div className="flex flex-col gap-6 pl-4 border-l border-[#D1C5B8]">
                {scheduledPickups.map((d, i) => (
                  <div key={d.id} className="relative">
                    <span
                      className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-[#FBF9F8] ${
                        i === 0 ? "bg-[#725A39]" : "bg-[#E4E2E1]"
                      }`}
                    />
                    <div className="font-body text-xs font-bold text-[#7F766A] mb-0.5">
                      {d.pickup_date} — {d.pickup_time || "TBD"}
                    </div>
                    <div className="font-body text-sm font-bold text-[#1B1C1C]">{d.product_name}</div>
                    {d.address && (
                      <div className="font-body text-xs text-[#4D453C] mt-0.5">📍 {d.address}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 font-sans text-sm text-[#7F766A]">
                Belum ada jadwal penjemputan.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Verification yield from real data */}
          <div className="bg-[#F6F3F2] border border-[#D1C5B8] rounded-xl p-6 shadow-xs">
            <h2 className="font-serif text-xl font-bold text-[#1B1C1C] mb-4">Distribusi Status</h2>
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
            <div className="mt-4 pt-3 border-t border-[#D1C5B8]">
              <div className="font-body text-xs text-[#7F766A]">Total submissions (non-draft): <span className="font-bold text-[#1B1C1C]">{totalProcessed}</span></div>
            </div>
          </div>

          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-xl p-6 shadow-xs">
            <h2 className="font-serif text-xl font-bold text-[#1B1C1C] mb-4">Tindakan Cepat</h2>
            <div className="flex flex-col gap-3">
              {[
                { label: "Lihat QC Queue", href: "/admin/qc" },
                { label: "Lihat Inventory", href: "/admin/inventory" },
                { label: "Lihat Analytics", href: "/admin/analytics" },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="bg-[#FBF9F8] border border-[#D1C5B8] hover:border-[#725A39] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1B1C1C] text-left hover:bg-white transition-all cursor-pointer shadow-2xs block"
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

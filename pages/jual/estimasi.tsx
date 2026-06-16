import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconCheck, IconShield, IconMapPin } from "../../components/Icons";
import { formatIDR } from "../../components/ProductCard";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";

function formatShortIDR(val: number) {
  if (val >= 1000000) {
    return `${(val / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace(".", ",")} jt`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toLocaleString("id-ID")}k`;
  }
  return String(val);
}

const chartMonths = [
  { label: "JAN", value: 134 },
  { label: "FEB", value: 125 },
  { label: "MAR", value: 115 },
  { label: "APR", value: 144 },
  { label: "MEI", value: 163 },
  { label: "JUN", value: 192 },
];

export default function EstimasiPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
  const [estimationPrice, setEstimationPrice] = useState(15000000);
  const [reasons, setReasons] = useState<{ title: string; desc: string }[]>([]);
  const [loadingEst, setLoadingEst] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map((m) => m.value)) : 1;

  useEffect(() => {
    const dataStr = sessionStorage.getItem("pending_submission");
    if (dataStr) {
      const parsed = JSON.parse(dataStr);
      setSubmission(parsed);

      async function fetchEstimation() {
        if (parsed.estimationPrice && parsed.isFromDraft) {
          setEstimationPrice(parsed.estimationPrice);
          setReasons([
            {
              title: "Spesifikasi & Detail",
              desc: `${parsed.productName} tahun pembelian ${parsed.purchaseYear || "-"}.`,
            },
            {
              title: "Kondisi & Fungsionalitas",
              desc: `Fisik: ${parsed.condition || "Baik"}. Fungsi: ${parsed.functionality || "Normal"}.`,
            },
            {
              title: "Kelengkapan",
              desc: `Kelengkapan: ${parsed.completeness || "Lengkap"}.`,
            }
          ]);

          const monthLabels = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGT", "SEP", "OKT", "NOV", "DES"];
          const generatedChart = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = monthLabels[d.getMonth()];
            const value = Math.round(parsed.estimationPrice * (1 - i * 0.015));
            generatedChart.push({ label, value });
          }
          setChartData(generatedChart);
          setLoadingEst(false);
          return;
        }

        setLoadingEst(true);
        try {
          const res = await fetch("/api/estimate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productName: parsed.productName,
              purchaseYear: parsed.purchaseYear,
              condition: parsed.condition,
              functionality: parsed.functionality,
              completeness: parsed.completeness,
            }),
          });

          if (!res.ok) throw new Error("Failed to fetch estimation");
          const data = await res.json();

          if (data.isElectronic === false) {
            setErrorMsg(data.error || "Produk ini bukan merupakan barang elektronik.");
            setLoadingEst(false);
            return;
          }

          setEstimationPrice(data.price);
          setReasons(data.reasons);

          // Set monthly price trend graph directly from API
          if (data.trend && data.trend.length > 0) {
            setChartData(data.trend);
          } else {
            const monthLabels = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGT", "SEP", "OKT", "NOV", "DES"];
            const generatedChart = [];
            for (let i = 5; i >= 0; i--) {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const label = monthLabels[d.getMonth()];
              const value = Math.round(data.price * (1 - i * 0.015));
              generatedChart.push({ label, value });
            }
            setChartData(generatedChart);
          }

          parsed.estimationPrice = data.price;
          sessionStorage.setItem("pending_submission", JSON.stringify(parsed));
        } catch (error) {
          console.error("Estimation fetch failed, using fallback:", error);
          const year = parseInt(parsed.purchaseYear) || 2022;
          const currentYear = new Date().getFullYear();
          const age = Math.max(0, currentYear - year);
          const fallbackPrice = Math.max(2500000, 22000000 - age * 3000000);

          setEstimationPrice(fallbackPrice);
          setReasons([
            {
              title: "Kondisi Fisik",
              desc: "Kondisi fisik sesuai deskripsi Anda. Tim kami akan melakukan validasi akhir saat penjemputan.",
            },
            {
              title: "Tingkat Permintaan",
              desc: "Perangkat ini memiliki likuiditas pasar yang tinggi di marketplace PindahTangan saat ini.",
            },
          ]);

          const monthLabels = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGT", "SEP", "OKT", "NOV", "DES"];
          const generatedChart = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = monthLabels[d.getMonth()];
            const value = Math.round(fallbackPrice * (1 - i * 0.015));
            generatedChart.push({ label, value });
          }
          setChartData(generatedChart);

          parsed.estimationPrice = fallbackPrice;
          sessionStorage.setItem("pending_submission", JSON.stringify(parsed));
        } finally {
          setLoadingEst(false);
        }
      }

      fetchEstimation();
    }
  }, []);

  async function handleSaveDraft() {
    if (!submission) return;
    setLoadingEst(true);
    try {
      if (submission.draftId) {
        const { error } = await supabase
          .from("submissions")
          .update({
            product_name: submission.productName,
            purchase_year: submission.purchaseYear,
            condition: submission.condition,
            functionality: submission.functionality,
            completeness: submission.completeness,
            address: submission.address || "",
            contact: submission.contact || "",
            status: "DRAFT",
            estimation_price: estimationPrice,
            image_url: submission.imageUrl || null,
            pickup_date: null,
            pickup_time: null,
          })
          .eq("id", submission.draftId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("submissions")
          .insert({
            user_id: user?.id,
            product_name: submission.productName,
            purchase_year: submission.purchaseYear,
            condition: submission.condition,
            functionality: submission.functionality,
            completeness: submission.completeness,
            address: submission.address || "",
            contact: submission.contact || "",
            status: "DRAFT",
            estimation_price: estimationPrice,
            image_url: submission.imageUrl || null,
            pickup_date: null,
            pickup_time: null,
          })
          .select();

        if (error) throw error;

        if (data && data[0]) {
          const updatedSubmission = {
            ...submission,
            draftId: data[0].id,
            estimationPrice: estimationPrice,
          };
          sessionStorage.setItem("pending_submission", JSON.stringify(updatedSubmission));
          setSubmission(updatedSubmission);
        }
      }

      sessionStorage.removeItem("pending_submission");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Gagal menyimpan draft:", err);
      setErrorMsg("Gagal menyimpan draft pengajuan. Silakan coba lagi.");
    } finally {
      setLoadingEst(false);
    }
  }

  if (!submission) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-16 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <span className="font-mono text-xs text-[#5F5E5E]">SUBMIT BARANG</span>
        <IconCheck className="w-3 h-3 text-[#5F5E5E]" />
        <span className="font-mono text-xs font-bold text-[#735A39]">ESTIMASI HARGA</span>
        <IconCheck className="w-3 h-3 text-[#5F5E5E]" />
        <span className="font-mono text-xs text-[#5F5E5E]">PENJEMPUTAN</span>
      </div>

      {errorMsg ? (
        <div className="bg-white border border-[#D1C4B8] rounded-xl p-8 max-w-xl mx-auto text-center flex flex-col gap-6 shadow-sm mt-10">
          <div className="w-16 h-16 bg-[#BA1A1A] rounded-full flex items-center justify-center mx-auto shadow-xs text-white">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#1B1C1C]">Pengajuan Ditolak oleh Sistem</h2>
            <p className="font-body text-sm text-[#5F5E5E] leading-relaxed">
              {errorMsg}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/jual?edit=true")}
              className="bg-[#303031] hover:bg-[#1B1C1C] text-white font-body font-bold py-4 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Kembali &amp; Ubah Detail Barang
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="border border-[#735A39] text-[#735A39] font-body font-bold py-4 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              Batal &amp; Ke Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#D1C4B8] rounded-xl p-8 flex flex-col gap-8 relative overflow-hidden shadow-xs">
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="w-full sm:w-64 h-64 bg-[#EFEDED] border border-[#D1C4B8] rounded-lg flex items-center justify-center text-[#A89070] flex-shrink-0 overflow-hidden relative">
                {submission.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={submission.imageUrl}
                    alt={submission.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-10 h-10 text-[#A89070]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1 justify-center">
                <div className="bg-[#E4E2E1] rounded-full px-3 py-1.5 w-fit flex items-center gap-1.5">
                  <IconShield className="w-3.5 h-3.5 text-[#1B1C1C]" />
                  <span className="font-body text-xs font-semibold text-[#1B1C1C]">Terverifikasi PindahTangan</span>
                </div>
                <h1 className="font-sans text-2xl font-bold text-[#1B1C1C] leading-tight">
                  {submission.productName}
                </h1>
                <p className="font-body text-sm text-[#5F5E5E]">
                  Kondisi: {submission.condition || "Baik"} · Kelengkapan: {submission.completeness || "Ada"}
                </p>

                <div className="mt-4 flex flex-col gap-1">
                  <span className="font-mono text-xs text-[#5F5E5E] font-semibold tracking-wider">ESTIMASI HARGA TERBAIK</span>
                  {loadingEst ? (
                    <div className="h-10 w-48 bg-[#EFEDED] animate-pulse rounded-md mt-1" />
                  ) : (
                    <span className="font-sans text-4xl font-bold text-[#725A39]">
                      {formatIDR(estimationPrice)}
                    </span>
                  )}
                  <span className="font-body text-xs font-semibold text-[#735A39] mt-0.5">Berlaku selama 7 hari</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#D1C4B8]" />

            <div className="flex flex-col gap-4">
              <h3 className="font-sans text-lg font-bold text-[#1B1C1C]">Mengapa harga ini?</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {loadingEst ? (
                  <>
                    <div className="bg-[#FBF9F8] border border-[#D1C4B8] rounded-xl p-4 flex flex-col gap-2 animate-pulse h-28" />
                    <div className="bg-[#FBF9F8] border border-[#D1C4B8] rounded-xl p-4 flex flex-col gap-2 animate-pulse h-28" />
                  </>
                ) : (
                  reasons.map((r) => (
                    <div key={r.title} className="bg-[#FBF9F8] border border-[#D1C4B8] rounded-xl p-4 flex flex-col gap-2 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <IconCheck className="w-4 h-4 text-[#735A39]" />
                        <span className="font-body text-sm font-bold text-[#1B1C1C]">{r.title}</span>
                      </div>
                      <p className="font-body text-xs text-[#5F5E5E] leading-relaxed">{r.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D1C4B8] rounded-xl p-8 flex flex-col gap-8 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sans text-lg font-bold text-[#1B1C1C]">Tren Harga Pasar</h3>
                <p className="font-body text-xs text-[#5F5E5E]">6 Bulan Terakhir</p>
              </div>
              <div className="text-right">
                {loadingEst || chartData.length === 0 ? (
                  <div className="h-5 w-24 bg-[#EFEDED] animate-pulse rounded ml-auto mb-1" />
                ) : (
                  <div className="font-body text-sm font-bold text-[#BA1A1A]">
                    -Rp {Math.abs(chartData[chartData.length - 1].value - chartData[chartData.length - 2].value).toLocaleString("id-ID")}
                  </div>
                )}
                <div className="font-mono text-[10px] font-bold text-[#5F5E5E] uppercase tracking-wider">DIBANDINGKAN ESTIMASI BULAN LALU</div>
              </div>
            </div>
            <div className="flex items-end gap-2 h-44">
              {loadingEst || chartData.length === 0 ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="flex-1 h-full flex flex-col items-center justify-end">
                    <div className="w-full flex-1 flex items-end justify-center">
                      <div className="w-full bg-[#EFEDED] animate-pulse rounded-t-lg" style={{ height: `${20 + idx * 12}%` }} />
                    </div>
                    <span className="h-3 w-8 bg-[#EFEDED] animate-pulse rounded mt-2" />
                  </div>
                ))
              ) : (
                chartData.map((m, i) => (
                  <div key={m.label} className="flex-1 h-full flex flex-col items-center justify-end">
                    <div className="w-full flex-1 flex flex-col justify-end items-center gap-1.5">
                      <span className="font-mono text-[9px] text-[#735A39] font-bold">
                        {formatShortIDR(m.value)}
                      </span>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          i === chartData.length - 1 ? "bg-[#C5A67F]" : "bg-[#E4E2E2]"
                        }`}
                        style={{ height: `${(m.value / maxValue) * 82}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-[#5F5E5E] font-semibold mt-2">{m.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#E9E8E7] border border-[#D1C4B8] rounded-xl p-8 flex flex-col gap-6 shadow-xs">
            <h3 className="font-sans text-lg font-bold text-[#1B1C1C]">Langkah Berikutnya</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#735A39] text-white flex items-center justify-center font-body text-sm font-bold flex-shrink-0 shadow-xs">1</div>
                <span className="font-body text-sm font-medium text-[#1B1C1C]">Setujui estimasi harga ini</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#80756A] text-[#4E453C] flex items-center justify-center font-body text-sm font-bold flex-shrink-0 shadow-xs">2</div>
                <span className="font-body text-sm text-[#1B1C1C]">Pilih jadwal penjemputan gratis ke rumah</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#80756A] text-[#4E453C] flex items-center justify-center font-body text-sm font-bold flex-shrink-0 shadow-xs">3</div>
                <span className="font-body text-sm text-[#1B1C1C]">QC di tempat dan pembayaran instan</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                disabled={loadingEst}
                onClick={() => router.push("/jual/penjadwalan")}
                className="bg-[#303031] hover:bg-[#1B1C1C] disabled:bg-[#D1C5B8] disabled:cursor-not-allowed text-[#FBF9F8] font-body font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                {loadingEst ? "Menganalisis Harga..." : "Setuju & Lanjutkan"}
              </button>
              <button
                disabled={loadingEst}
                onClick={handleSaveDraft}
                className="border border-[#735A39] text-[#735A39] disabled:border-[#D1C5B8] disabled:text-[#D1C5B8] font-body font-bold py-4 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                Simpan sebagai Draft
              </button>
              <Link href="/jual?edit=true" className="font-body text-xs font-semibold text-[#5F5E5E] text-center hover:underline mt-1">
                Ganti detail barang? Edit data.
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#D1C4B8] rounded-xl p-6 flex items-start gap-4 shadow-xs">
            <div className="w-12 h-12 bg-[#C5A67F] rounded-xl flex items-center justify-center flex-shrink-0">
              <IconShield className="w-5 h-5 text-[#735A39]" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-body text-sm font-bold text-[#1B1C1C]">Janji PindahTangan</h4>
              <p className="font-body text-xs text-[#5F5E5E] leading-relaxed">
                Kami menjamin transparansi harga. Jika hasil inspeksi berbeda dari deskripsi, Anda akan dikonfirmasi sebelum harga final ditentukan.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#D1C4B8] rounded-xl overflow-hidden shadow-xs">
            <div className="bg-[#F5F3F3] border-b border-[#D1C5B8] px-4 py-3 flex justify-between items-center">
              <span className="font-body text-xs font-bold text-[#1B1C1C] uppercase tracking-wider">Layanan Penjemputan</span>
              <span className="font-mono text-[10px] font-bold text-[#735A39]">AKTIF DI SURABAYA</span>
            </div>
            <div className="relative h-44 w-full bg-[#E4E2E2] overflow-hidden">
              <iframe
                title="Peta Layanan Surabaya"
                width="100%"
                height="100%"
                src="https://www.openstreetmap.org/export/embed.html?bbox=112.60%2C-7.35%2C112.85%2C-7.15&amp;layer=mapnik"
                className="w-full h-full border-0 grayscale-[40%] contrast-[110%] opacity-90"
                style={{ border: 0 }}
              />
              <div className="absolute top-3 left-3 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#D1C4B8] shadow-sm flex items-center gap-2">
                  <IconMapPin className="w-3.5 h-3.5 text-[#735A39]" />
                  <span className="font-body text-xs font-semibold text-[#1B1C1C]">Area Layanan Surabaya</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="font-body text-xs text-[#4E453C] leading-relaxed">
                Kurir kami tersedia di area layanan dalam 2 jam setelah Anda menyetujui penawaran ini.
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

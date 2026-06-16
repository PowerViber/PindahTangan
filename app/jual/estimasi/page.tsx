"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCheck, IconShield, IconMapPin } from "../../components/Icons";

const chartMonths = [
  { label: "JAN", value: 134 },
  { label: "FEB", value: 125 },
  { label: "MAR", value: 115 },
  { label: "APR", value: 144 },
  { label: "MEI", value: 163 },
  { label: "JUN", value: 192 },
];

const reasons = [
  { title: "Kondisi Fisik",        desc: "Mulus (Mint) tanpa baret atau penyok, layar dan keyboard dalam kondisi optimal." },
  { title: "Kelengkapan & Spesifikasi", desc: "1TB SSD, 32GB RAM, charger original — kelengkapan penuh menaikkan nilai jual." },
];

export default function EstimasiPage() {
  const router = useRouter();
  const maxValue = Math.max(...chartMonths.map((m) => m.value));

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-16 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <span className="font-mono text-sm text-[#5F5E5E]">SUBMIT BARANG</span>
        <IconCheck className="w-3 h-3 text-[#5F5E5E]" />
        <span className="font-mono text-sm font-bold text-[#735A39]">ESTIMASI HARGA</span>
        <IconCheck className="w-3 h-3 text-[#5F5E5E]" />
        <span className="font-mono text-sm text-[#5F5E5E]">PENJEMPUTAN</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#D1C4B8] rounded-lg p-8 flex flex-col gap-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="w-full sm:w-72 h-72 bg-[#EFEDED] border border-[#D1C4B8] rounded-sm flex items-center justify-center text-[#A89070] text-xs flex-shrink-0">
                Foto Produk
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="bg-[#E4E2E1] rounded-full px-3 py-1.5 w-fit flex items-center gap-1.5">
                  <IconShield className="w-3.5 h-3.5 text-[#1B1C1C]" />
                  <span className="font-body text-xs font-medium text-[#1B1C1C]">Terverifikasi PindahTangan</span>
                </div>
                <h1 className="font-sans text-3xl font-semibold text-[#1B1C1C] leading-tight">
                  MacBook Pro 16&quot; (2023) M2 Max
                </h1>
                <p className="font-body text-base text-[#5F5E5E]">Kondisi: Mulus (Mint) · 1TB SSD · 32GB RAM</p>

                <div className="mt-6 flex flex-col gap-1">
                  <span className="font-mono text-sm text-[#5F5E5E]">ESTIMASI HARGA TERBAIK</span>
                  <span className="font-sans text-5xl font-bold text-[#1B1C1C]">Rp28.500.000</span>
                  <span className="font-body text-sm font-bold text-[#735A39]">Berlaku selama 7 hari</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#D1C4B8]" />

            <div className="flex flex-col gap-4">
              <h3 className="font-sans text-xl font-medium text-[#1B1C1C]">Mengapa harga ini?</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {reasons.map((r) => (
                  <div key={r.title} className="bg-[#FBF9F8] border border-[#D1C4B8] rounded-sm p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <IconCheck className="w-4 h-4 text-[#735A39]" />
                      <span className="font-body text-sm font-bold text-[#1B1C1C]">{r.title}</span>
                    </div>
                    <p className="font-body text-sm text-[#5F5E5E]">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D1C4B8] rounded-lg p-8 flex flex-col gap-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sans text-xl font-medium text-[#1B1C1C]">Tren Harga Pasar</h3>
                <p className="font-body text-sm text-[#5F5E5E]">6 Bulan Terakhir</p>
              </div>
              <div className="text-right">
                <div className="font-body text-base font-bold text-[#735A39]">+Rp 1.200.000</div>
                <div className="font-mono text-xs text-[#5F5E5E]">DIBANDINGKAN ESTIMASI BULAN LALU</div>
              </div>
            </div>
            <div className="flex items-end gap-2 h-48">
              {chartMonths.map((m, i) => (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-sm ${i === chartMonths.length - 1 ? "bg-[#C5A67F]" : "bg-[#E4E2E2]"}`}
                    style={{ height: `${(m.value / maxValue) * 100}%` }}
                  />
                  <span className="font-mono text-xs text-[#5F5E5E]">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#E9E8E7] border border-[#D1C4B8] rounded-lg p-8 flex flex-col gap-6">
            <h3 className="font-sans text-xl font-medium text-[#1B1C1C]">Langkah Berikutnya</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#735A39] text-white flex items-center justify-center font-body text-sm font-bold flex-shrink-0">1</div>
                <span className="font-body text-sm font-medium text-[#1B1C1C]">Setujui estimasi harga ini</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#80756A] text-[#4E453C] flex items-center justify-center font-body text-sm font-bold flex-shrink-0">2</div>
                <span className="font-body text-sm text-[#1B1C1C]">Pilih jadwal penjemputan gratis ke rumah</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#80756A] text-[#4E453C] flex items-center justify-center font-body text-sm font-bold flex-shrink-0">3</div>
                <span className="font-body text-sm text-[#1B1C1C]">QC di tempat dan pembayaran instan</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/jual/penjadwalan")}
                className="bg-[#303031] hover:bg-[#1B1C1C] text-[#FBF9F8] font-body font-bold py-4 rounded-sm flex items-center justify-center gap-2 transition-colors"
              >
                Setuju &amp; Lanjutkan ke Penjemputan
              </button>
              <button className="border border-[#735A39] text-[#735A39] font-body font-bold py-4 rounded-sm hover:bg-white transition-colors">
                Simpan sebagai Draft
              </button>
              <Link href="/jual" className="font-body text-sm font-medium text-[#5F5E5E] text-center hover:underline">
                Ada kesalahan detail barang? Edit data.
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#D1C4B8] rounded-lg p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-[#C5A67F] rounded-xl flex items-center justify-center flex-shrink-0">
              <IconShield className="w-5 h-5 text-[#735A39]" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-body text-base font-bold text-[#1B1C1C]">Janji PindahTangan</h4>
              <p className="font-body text-sm text-[#5F5E5E]">
                Kami menjamin transparansi harga. Jika hasil inspeksi berbeda dari deskripsi, kamu akan dikonfirmasi sebelum harga final ditentukan.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#D1C4B8] rounded-lg overflow-hidden">
            <div className="bg-[#F5F3F3] border-b border-[#D1C4B8] px-4 py-3 flex justify-between items-center">
              <span className="font-body text-sm font-bold text-[#1B1C1C]">Layanan Penjemputan</span>
              <span className="font-mono text-xs font-medium text-[#735A39]">AKTIF DI JAKARTA</span>
            </div>
            <div className="bg-[#E4E2E2] h-40 flex items-center justify-center text-[#7F766A] text-xs gap-2">
              <IconMapPin className="w-4 h-4" />
              Peta Jakarta
            </div>
            <div className="p-4">
              <p className="font-body text-sm text-[#4E453C]">
                Kurir kami tersedia di area Jakarta Selatan dalam 2 jam setelah Anda menyetujui penawaran ini.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

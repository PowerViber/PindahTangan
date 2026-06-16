import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { formatIDR } from "../../../components/ProductCard";
import { IconArrowLeft, IconCheck, IconMapPin } from "../../../components/Icons";

interface Submission {
  id: string;
  user_id: string;
  product_name: string;
  purchase_year: string;
  condition: string;
  functionality: string;
  completeness: string;
  address: string;
  contact: string;
  status: string;
  estimation_price: number;
  image_url?: string | null;
  pickup_date: string;
  pickup_time: string;
  created_at: string;
}

const grades = [
  { value: "MINT", label: "Mint", desc: "Seperti baru, tanpa cacat berarti" },
  { value: "GOOD", label: "Good", desc: "Kondisi baik, tanda pakai wajar" },
  { value: "FAIR", label: "Fair", desc: "Berfungsi normal, tanda pakai jelas" },
];

export default function InspectionPage() {
  const router = useRouter();
  const { id } = router.query;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState("GOOD");
  const [finalPrice, setFinalPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<"published" | "cancelled" | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchSubmission() {
      setLoading(true);
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setSubmission(data as Submission);
        setFinalPrice(String(data.estimation_price ?? ""));
      }
      setLoading(false);
    }

    fetchSubmission();
  }, [id]);

  async function handlePublish() {
    if (!submission) return;
    const priceNum = Number(finalPrice);
    if (!priceNum || priceNum <= 0) {
      setErrorMsg("Masukkan harga akhir yang valid.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const { error: productError } = await supabase.from("products").insert({
        name: submission.product_name,
        grade,
        price: priceNum,
        image_url: submission.image_url || null,
        seller_id: submission.user_id,
        submission_id: submission.id,
      });

      if (productError) throw new Error(productError.message);

      const { error: statusError } = await supabase
        .from("submissions")
        .update({ status: "ACTIVE" })
        .eq("id", submission.id);

      if (statusError) throw new Error(statusError.message);

      setResult("published");
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menyimpan hasil inspeksi. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelSubmission() {
    if (!submission) return;
    const confirmed = confirm(
      "Batalkan pengajuan ini karena data/kondisi tidak sesuai? Barang tidak akan ditampilkan di marketplace."
    );

    if (!confirmed) return;

    setSaving(true);
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("submissions")
        .update({ status: "CANCELLED" })
        .eq("id", submission.id);

      if (error) throw new Error(error.message);

      setResult("cancelled");
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal membatalkan pengajuan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="px-20 py-20 max-w-2xl text-center">
        <p className="font-body text-lg text-[#4D453C] mb-4">Pengajuan tidak ditemukan.</p>
        <Link href="/admin/qc" className="font-body text-sm font-bold text-[#725A39] hover:underline">
          Kembali ke QC Queue
        </Link>
      </div>
    );
  }

  if (result) {
    const isCancelled = result === "cancelled";

    return (
      <div className="px-20 py-20 max-w-2xl text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs ${isCancelled ? "bg-[#BA1A1A]" : "bg-[#735A39]"}`}>
          <IconCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#1B1C1C] mb-2">
          {isCancelled ? "Pengajuan Dibatalkan" : "Inspeksi Selesai"}
        </h2>
        <p className="font-body text-sm text-[#4D453C] mb-8">
          {isCancelled
            ? `${submission.product_name} telah ditandai CANCELLED dan tidak ditampilkan di Marketplace.`
            : `${submission.product_name} telah ditandai sebagai ${grade} dengan harga ${formatIDR(finalPrice)} dan kini terdaftar di Marketplace.`}
        </p>
        <Link
          href="/admin/qc"
          className="bg-[#1B1C1C] hover:bg-[#333333] text-white font-body font-bold px-8 py-3.5 rounded-lg transition-colors inline-block"
        >
          Kembali ke QC Queue
        </Link>
      </div>
    );
  }

  if (submission.status !== "PENDING") {
    return (
      <div className="px-20 py-20 max-w-2xl text-center">
        <p className="font-body text-lg text-[#4D453C] mb-4">
          Pengajuan ini sudah diproses sebelumnya (status: {submission.status}).
        </p>
        <Link href="/admin/qc" className="font-body text-sm font-bold text-[#725A39] hover:underline">
          Kembali ke QC Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="px-12 py-12 max-w-5xl">
      <Link href="/admin/qc" className="inline-flex items-center gap-2 font-body text-sm font-semibold text-[#4D453C] hover:text-[#1B1C1C] mb-8">
        <IconArrowLeft className="w-4 h-4" />
        Kembali ke QC Queue
      </Link>

      {errorMsg && (
        <div className="bg-[#FFDAD6] border border-[#BA1A1A]/30 text-[#BA1A1A] p-4 rounded-lg text-sm font-semibold mb-6">
          {errorMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="flex flex-col gap-8">
          <div className="bg-white border border-[#D1C5B8] rounded-xl p-8 flex flex-col sm:flex-row gap-8 shadow-xs">
            <div className="w-full sm:w-64 h-64 bg-[#EFEDED] border border-[#D1C5B8] rounded-lg flex items-center justify-center text-[#A89070] flex-shrink-0 overflow-hidden">
              {submission.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={submission.image_url} alt={submission.product_name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-body text-xs text-[#7F766A]">Tidak ada gambar</span>
              )}
            </div>
            <div className="flex flex-col gap-3 flex-1 justify-center">
              <h1 className="font-serif text-2xl font-bold text-[#1B1C1C]">{submission.product_name}</h1>
              <div className="grid grid-cols-2 gap-3 font-body text-sm">
                <div>
                  <div className="text-xs text-[#7F766A] font-semibold uppercase tracking-wide">Tahun Beli</div>
                  <div className="text-[#1B1C1C]">{submission.purchase_year || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-[#7F766A] font-semibold uppercase tracking-wide">Estimasi Awal</div>
                  <div className="text-[#1B1C1C] font-bold">{formatIDR(submission.estimation_price)}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-[#7F766A] font-semibold uppercase tracking-wide">Kondisi Fisik</div>
                  <div className="text-[#1B1C1C]">{submission.condition || "-"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-[#7F766A] font-semibold uppercase tracking-wide">Fungsionalitas</div>
                  <div className="text-[#1B1C1C]">{submission.functionality || "-"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-[#7F766A] font-semibold uppercase tracking-wide">Kelengkapan</div>
                  <div className="text-[#1B1C1C]">{submission.completeness || "-"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D1C5B8] rounded-xl p-8 flex items-start gap-4 shadow-xs">
            <IconMapPin className="w-5 h-5 text-[#725A39] mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-body text-sm font-bold text-[#1B1C1C]">{submission.address || "-"}</div>
              <div className="font-body text-xs text-[#7F766A] mt-1">
                Kontak: {submission.contact || "-"} · Jemput: {submission.pickup_date || "-"}, {submission.pickup_time || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#303031] text-white rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs h-fit">
          <h3 className="font-sans text-base font-semibold border-b border-[#4E453C] pb-3">Hasil Inspeksi</h3>

          <div className="flex flex-col gap-3">
            <label className="font-body text-xs font-bold text-[#C9C6C0] uppercase tracking-wider">Grade Kondisi</label>
            <div className="flex flex-col gap-2">
              {grades.map((g) => (
                <button
                  type="button"
                  key={g.value}
                  onClick={() => setGrade(g.value)}
                  className={`rounded-lg p-3 flex flex-col items-start text-left border transition-colors cursor-pointer ${
                    grade === g.value ? "bg-[#735A39] border-[#D2B48C]" : "bg-transparent border-[#4E453C] hover:border-[#735A39]"
                  }`}
                >
                  <span className="font-body text-sm font-bold">{g.label}</span>
                  <span className="font-body text-xs text-[#C9C6C0]">{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-body text-xs font-bold text-[#C9C6C0] uppercase tracking-wider">Harga Akhir (IDR)</label>
            <input
              type="number"
              min={0}
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              placeholder="0"
              className="bg-white text-[#1B1C1C] rounded-lg px-4 py-3 text-base font-body font-bold focus:outline-none"
            />
            <span className="font-body text-xs text-[#C9C6C0]">{formatIDR(finalPrice)}</span>
          </div>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="w-full bg-[#D2B48C] hover:bg-[#C5A67F] disabled:bg-[#80756A] text-[#5B4526] font-body font-bold py-4 rounded-lg transition-colors cursor-pointer flex justify-center items-center shadow-xs"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-[#5B4526] border-t-transparent rounded-full animate-spin" />
            ) : (
              "Selesaikan & Tampilkan di Marketplace"
            )}
          </button>
          <button
            onClick={handleCancelSubmission}
            disabled={saving}
            className="w-full border border-[#FFDAD6] text-[#FFDAD6] hover:bg-[#BA1A1A]/20 disabled:border-[#80756A] disabled:text-[#80756A] disabled:cursor-not-allowed font-body font-bold py-3.5 rounded-lg transition-colors cursor-pointer"
          >
            Batalkan Pengajuan
          </button>
          <p className="font-body text-xs text-[#C9C6C0] leading-relaxed">
            Gunakan batalkan jika kondisi fisik, fungsi, atau informasi barang tidak sesuai. Barang yang dibatalkan tidak akan masuk Marketplace.
          </p>
        </div>
      </div>
    </div>
  );
}

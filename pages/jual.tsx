import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/AuthContext";
import { IconShield, IconUpload } from "../components/Icons";
import { supabase } from "../lib/supabase";
import { compressImage } from "../lib/imageCompressor";

const promiseItems = [
  { title: "White-Glove Pickup",    desc: "Dijadwalkan sesuai dengan kenyamanan Anda." },
  { title: "Technical Inspection",  desc: "Inspeksi kualitas 50-titik yang ketat." },
  { title: "Studio Photography",    desc: "Menampilkan barang Anda dengan tampilan terbaik." },
];

export default function SellerPanelPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    productName: "",
    purchaseYear: "",
    condition: "",
    functionality: "",
    completeness: "",
    address: "",
    contact: "",
    imageUrl: "",
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  function update(field: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    setImagePreview(URL.createObjectURL(file));

    try {
      const compressedBlob = await compressImage(file, 1000, 1000, 0.75);

      const fileExt = "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `submissions/${fileName}`;

      const { data, error } = await supabase.storage
        .from("PindahTangan")
        .upload(filePath, compressedBlob, {
          contentType: "image/jpeg",
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("PindahTangan")
        .getPublicUrl(filePath);

      update("imageUrl", publicUrl);
    } catch (err: any) {
      console.error(err);
      setUploadError("Gagal mengunggah foto. Pastikan bucket 'PindahTangan' sudah dikonfigurasi.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("pending_submission", JSON.stringify(form));
    router.push("/jual/estimasi");
  }

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-20 py-10">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Form area */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-serif text-3xl font-bold text-[#1B1C1C]">Ajukan Barang Elektronik</h1>
            <p className="font-sans text-base text-[#4D453C]">Mulai proses verifikasi untuk perangkat elektronik bekas Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-[#E8E2D9] rounded-xl p-8 sm:p-12 flex flex-col gap-8 shadow-xs">
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm font-semibold text-[#4D453C]">Nama Produk</label>
              <input
                type="text"
                required
                value={form.productName}
                onChange={(e) => update("productName", e.target.value)}
                placeholder="Contoh: Apple MacBook Pro M2 14-inch"
                className="font-sans border border-[#D1C5B8] rounded-lg px-4 py-3 text-base placeholder-[#4D453C]/40 focus:outline-none focus:border-[#725A39] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm font-semibold text-[#4D453C]">Tahun Pembelian</label>
                <input
                  type="text"
                  required
                  value={form.purchaseYear}
                  onChange={(e) => update("purchaseYear", e.target.value)}
                  placeholder="YYYY"
                  maxLength={4}
                  className="font-sans border border-[#D1C5B8] rounded-lg px-4 py-3 text-base placeholder-[#4D453C]/40 focus:outline-none focus:border-[#725A39] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm font-semibold text-[#4D453C]">Kelengkapan</label>
                <input
                  type="text"
                  value={form.completeness}
                  onChange={(e) => update("completeness", e.target.value)}
                  placeholder="Contoh: Box original, charger, kabel"
                  className="font-sans border border-[#D1C5B8] rounded-lg px-4 py-3 text-base placeholder-[#4D453C]/40 focus:outline-none focus:border-[#725A39] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm font-semibold text-[#4D453C]">Kondisi Fisik Saat Ini</label>
              <input
                type="text"
                required
                value={form.condition}
                onChange={(e) => update("condition", e.target.value)}
                placeholder="Contoh: Mulus sekali, ada baret halus di layar belakang"
                className="font-sans border border-[#D1C5B8] rounded-lg px-4 py-3 text-base placeholder-[#4D453C]/40 focus:outline-none focus:border-[#725A39] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm font-semibold text-[#4D453C]">Fungsionalitas</label>
              <input
                type="text"
                required
                value={form.functionality}
                onChange={(e) => update("functionality", e.target.value)}
                placeholder="Contoh: Baterai health 85%, tombol keyboard normal semua"
                className="font-sans border border-[#D1C5B8] rounded-lg px-4 py-3 text-base placeholder-[#4D453C]/40 focus:outline-none focus:border-[#725A39] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm font-semibold text-[#4D453C]">Nomor Kontak (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={form.contact}
                  onChange={(e) => update("contact", e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="font-sans border border-[#D1C5B8] rounded-lg px-4 py-3 text-base placeholder-[#4D453C]/40 focus:outline-none focus:border-[#725A39] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm font-semibold text-[#4D453C]">Alamat Penjemputan</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Contoh: Jl. Sudirman No. 12, Jakarta"
                  className="font-sans border border-[#D1C5B8] rounded-lg px-4 py-3 text-base placeholder-[#4D453C]/40 focus:outline-none focus:border-[#725A39] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm font-semibold text-[#4D453C] flex items-center gap-2">
                <IconUpload className="w-4 h-4 text-[#7F766A]" />
                Foto Perangkat
              </label>

              {uploadError && (
                <div className="bg-[#FFDAD6] border border-[#BA1A1A]/30 text-[#BA1A1A] p-4 rounded-lg text-sm font-semibold">
                  {uploadError}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D1C5B8] hover:border-[#725A39] rounded-lg bg-white p-8 flex flex-col items-center text-center gap-3 cursor-pointer hover:bg-[#F6F3F2] transition-colors relative h-48 justify-center overflow-hidden"
              >
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Pratinjau"
                      className="absolute inset-0 w-full h-full object-contain bg-[#F6F3F2]"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mengompres &amp; Mengunggah...
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <IconUpload className="w-8 h-8 text-[#7F766A]" />
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-base font-semibold text-[#1B1C1C]">Klik untuk unggah foto perangkat</span>
                      <span className="font-body text-xs text-[#7F766A] max-w-sm">
                        Kami akan mengompres foto Anda secara otomatis untuk menghemat data.
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="bg-[#D2B48C] hover:bg-[#C5A67F] disabled:bg-[#D1C5B8] text-[#5B4526] font-body font-bold text-base py-4 px-10 rounded-lg w-fit transition-colors cursor-pointer self-start shadow-xs"
            >
              Minta Estimasi Harga
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80">
          <div className="bg-[#F6F3F2] border border-[#D1C5B8] rounded-xl p-6 flex flex-col gap-4 sticky top-24">
            <h3 className="font-serif text-xl font-bold text-[#1B1C1C] flex items-center gap-2">
              <IconShield className="w-5 h-5 text-[#725A39]" />
              Komitmen PindahTangan
            </h3>
            <p className="font-sans text-sm text-[#4D453C] leading-relaxed">
              Kami menangani seluruh siklus penjualan kembali, memastikan presentasi premium dan kualitas terverifikasi untuk setiap pembeli.
            </p>
            <div className="flex flex-col gap-4 pl-1 mt-2">
              {promiseItems.map((p) => (
                <div key={p.title} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D2B48C] mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-body text-sm font-bold text-[#1B1C1C]">{p.title}</div>
                    <div className="font-body text-xs text-[#4D453C] mt-0.5">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

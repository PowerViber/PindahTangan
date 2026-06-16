import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconClipboard, IconTruck, IconCamera, IconWallet,
  IconClock, IconSearch, IconChart, IconStore, IconShield, IconCard,
  IconPhone, IconSneaker, IconHome, IconBook, IconSport,
  IconStar,
} from "../components/Icons";

const steps = [
  { num: "01", Icon: IconClipboard, title: "Submit Barang", desc: "Isi form singkat — nama, kategori, dan kondisi barang. Sistem kasih estimasi harga langsung." },
  { num: "02", Icon: IconTruck,     title: "Kami Jemput",   desc: "Pilih jadwal, kurir kami datang ke pintumu. Kamu tidak perlu kemana-mana." },
  { num: "03", Icon: IconCamera,    title: "Kami Urus Semua", desc: "QC, foto profesional, listing di marketplace. Semua dikerjain tim kami." },
  { num: "04", Icon: IconWallet,    title: "Terima Hasilnya", desc: "Barang laku? Dana langsung masuk ke dashboardmu, siap dicairkan kapan saja." },
];

const categories = [
  { label: "Gadget & Elektronik", Icon: IconPhone,   popular: true },
  { label: "Kamera & Hobi",       Icon: IconCamera,  popular: true },
  { label: "Fashion Branded",      Icon: IconSneaker, popular: true },
  { label: "Peralatan Rumah",      Icon: IconHome,    popular: false },
  { label: "Buku & Koleksi",       Icon: IconBook,    popular: false },
  { label: "Olahraga",             Icon: IconSport,   popular: false },
];

const features = [
  { Icon: IconClock,  title: "Tidak Perlu Waktu Ekstra",    desc: "Tidak ada foto-foto, tidak ada balas chat, tidak ada negosiasi. Cukup submit dan kami urus semuanya dari awal sampai selesai." },
  { Icon: IconSearch, title: "QC & Foto Profesional",       desc: "Setiap barang dicek kondisinya dan dipotret secara profesional sebelum dijual. Hasilnya? Barang lebih cepat laku dengan harga terbaik." },
  { Icon: IconChart,  title: "Pantau Secara Real-Time",     desc: "Dashboard personalmu menampilkan status barang dari dijemput hingga sold. Tidak ada yang disembunyikan, semua transparan." },
  { Icon: IconStore,  title: "Dijual Lewat Official Store", desc: "Barangmu dijual lewat akun toko resmi PindahTangan yang sudah punya reputasi tinggi di berbagai marketplace besar." },
  { Icon: IconCard,   title: "Pencairan Otomatis",          desc: "Dana hasil penjualan langsung masuk ke saldo akunmu setelah masa garansi pembeli (3–7 hari). Cairkan kapan pun kamu mau." },
  { Icon: IconShield, title: "Aman & Terpercaya",           desc: "Penipuan di marketplace? Bukan urusanmu. Kami menangani semua transaksi lewat sistem yang aman dan terverifikasi." },
];

const testimonials = [
  { name: "Anisa R.", city: "Jakarta", text: "Gue udah numpuk iPhone lama selama setahun. Iseng coba PindahTangan, eh dalam seminggu langsung laku. Tinggal duduk doang!", earned: "Rp1.840.000" },
  { name: "Budi S.",  city: "Bandung", text: "Sempet ragu, tapi prosesnya beneran transparan. Bisa pantau barang dari dijemput sampai sold lewat dashboard. Recommended banget.", earned: "Rp920.000" },
  { name: "Clara M.", city: "Surabaya", text: "Kamera mirrorless gue yang udah lama nganggur akhirnya terjual dengan harga bagus. Foto produknya juga profesional banget.", earned: "Rp3.200.000" },
];

const stats = [
  { value: "10.000+", label: "Barang Terjual" },
  { value: "4.8 / 5",  label: "Rating Penjual" },
  { value: "3–7 hari", label: "Rata-rata Laku" },
  { value: "100%",     label: "Pickup Tepat Waktu" },
];

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-[#D2B48C] text-[#5B4526] text-xs font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-widest font-body">
              Zero-Effort Selling
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1B1C1C] leading-[1.1] mb-5">
              Barang Nganggur?<br />
              <span className="text-[#725A39]">Kami yang Jualin.</span>
            </h1>
            <p className="font-sans text-lg text-[#4D453C] mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Submit barang bekasmu, kami jemput, kami foto, kami jual. Kamu cukup nunggu dananya masuk.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/jual"
                className="bg-[#725A39] hover:bg-[#5B4526] text-white font-body font-bold px-8 py-4 rounded-sm text-center transition-colors shadow-sm text-lg"
              >
                Jual Sekarang
              </Link>
              <Link
                href="/dashboard"
                className="border border-[#D1C5B8] text-[#4D453C] hover:border-[#725A39] hover:text-[#725A39] font-body font-semibold px-8 py-4 rounded-sm text-center transition-colors"
              >
                Lihat Dashboard
              </Link>
            </div>
            <div className="flex gap-6 mt-10 justify-center lg:justify-start">
              <div className="text-center">
                <div className="font-serif text-2xl font-semibold text-[#725A39]">10.832+</div>
                <div className="font-body text-xs text-[#4D453C]">Target Penjual</div>
              </div>
              <div className="w-px bg-[#D1C5B8]" />
              <div className="text-center">
                <div className="font-serif text-2xl font-semibold text-[#725A39]">20%</div>
                <div className="font-body text-xs text-[#4D453C]">Komisi Saja</div>
              </div>
              <div className="w-px bg-[#D1C5B8]" />
              <div className="text-center">
                <div className="font-serif text-2xl font-semibold text-[#725A39]">22.8%</div>
                <div className="font-body text-xs text-[#4D453C]">CAGR Pasar</div>
              </div>
            </div>
          </div>

          {/* Hero visual — app mockup card */}
          <div className="flex-1 flex justify-center lg:justify-end w-full max-w-md lg:max-w-none">
            <div className="relative w-full max-w-sm">
              <div className="bg-white border border-[#D1C5B8] rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-serif text-xl font-medium text-[#1B1C1C]">PindahTangan</span>
                </div>

                <div className="bg-[#FBF9F8] rounded-sm p-4 mb-3 border border-[#D1C5B8]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-[#D2B48C] text-[#5B4526] px-2 py-0.5 rounded-sm font-body font-bold">Sedang Diproses</span>
                    <span className="font-body text-xs text-[#7F766A]">PT-003</span>
                  </div>
                  <div className="font-serif font-medium text-[#1B1C1C]">iPhone 14 Pro 128GB</div>
                  <div className="font-body text-xs text-[#4D453C] mt-1">Gadget & Elektronik · Like New</div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="font-body text-xs text-[#4D453C]">Estimasi</span>
                    <span className="font-body font-bold text-[#725A39]">Rp7.200.000</span>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {["Dijemput","QC","Foto","Listed","Sold"].map((s, i) => (
                      <div key={s} className={`flex-1 h-1.5 rounded-full ${i < 2 ? "bg-[#725A39]" : "bg-[#E4E2E1]"}`} />
                    ))}
                  </div>
                </div>

                <div className="bg-[#1B1C1C] text-white rounded-sm p-4">
                  <div className="font-body text-xs text-[#D2B48C] mb-1">Saldo siap cair</div>
                  <div className="font-serif text-2xl font-semibold">Rp1.840.000</div>
                  <div className="font-body text-xs text-[#A89070] mt-1">dari 2 item terjual bulan ini</div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-[#725A39] text-white text-xs font-body font-bold px-3 py-2 rounded-sm shadow-sm">
                Laku dalam 5 hari
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#1B1C1C]">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-2xl font-semibold text-[#D2B48C]">{s.value}</div>
              <div className="font-body text-xs text-[#D1C5B8] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="cara-kerja" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#1B1C1C] mb-3">Semudah 1, 2, 3, 4.</h2>
          <p className="font-sans text-[#4D453C] max-w-md mx-auto">Dari submit sampai uang di tangan, kami yang urus semua prosesnya.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center text-center group">
              <div className="relative mb-5">
                <div className="w-20 h-20 bg-white border border-[#D1C5B8] group-hover:border-[#725A39] rounded-lg flex items-center justify-center transition-colors shadow-sm">
                  <s.Icon className="w-8 h-8 text-[#725A39]" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#725A39] rounded-full flex items-center justify-center text-white text-xs font-body font-bold">
                  {s.num}
                </div>
              </div>
              <h3 className="font-serif font-semibold text-[#1B1C1C] text-lg mb-2">{s.title}</h3>
              <p className="font-body text-sm text-[#4D453C] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/jual" className="bg-[#725A39] hover:bg-[#5B4526] text-white font-body font-bold px-10 py-4 rounded-sm inline-block transition-colors shadow-sm">
            Coba Sekarang — Gratis
          </Link>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-[#F6F3F2] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-semibold text-[#1B1C1C] mb-2">Kami Terima Berbagai Kategori</h2>
            <p className="font-body text-[#4D453C] text-sm">Barang layak pakai di semua kondisi</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div
                key={c.label}
                className="bg-white border border-[#D1C5B8] hover:border-[#725A39] rounded-sm p-5 flex items-center gap-4 cursor-pointer transition-colors group"
              >
                <div className="w-10 h-10 bg-[#F6F3F2] rounded-sm flex items-center justify-center flex-shrink-0 group-hover:bg-[#D2B48C] transition-colors">
                  <c.Icon className="w-5 h-5 text-[#725A39]" />
                </div>
                <div>
                  <div className="font-body font-bold text-[#1B1C1C] text-sm group-hover:text-[#725A39] transition-colors">{c.label}</div>
                  {c.popular && <div className="font-body text-xs text-[#725A39] font-medium mt-0.5">Populer</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="kenapa-kami" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#1B1C1C] mb-3">Kenapa PindahTangan?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="w-12 h-12 bg-[#F6F3F2] border border-[#D1C5B8] rounded-sm flex items-center justify-center flex-shrink-0">
                <f.Icon className="w-5 h-5 text-[#725A39]" />
              </div>
              <div>
                <h3 className="font-body font-bold text-[#1B1C1C] mb-1">{f.title}</h3>
                <p className="font-body text-sm text-[#4D453C] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#1B1C1C] py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-semibold text-white mb-2">Yang Mereka Bilang</h2>
            <p className="font-body text-[#D2B48C] text-sm">Ribuan penjual sudah merasakan manfaatnya</p>
          </div>

          <div className="relative flex flex-col items-center">
            {/* Horizontal Scroll Container / Slider Wrapper */}
            <div className="flex items-center justify-between w-full max-w-4xl gap-4 md:gap-8 py-6">
              {/* Left Button */}
              <button
                onClick={() => setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className="w-10 h-10 rounded-full border border-[#D2B48C] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#1B1C1C] flex items-center justify-center transition-colors font-bold focus:outline-none z-20"
              >
                &larr;
              </button>

              {/* Slider Viewport */}
              <div className="flex-1 overflow-hidden py-4 px-2">
                <div
                  className="flex items-center justify-center transition-transform duration-500 ease-in-out gap-4 md:gap-6"
                  style={{
                    transform: `translateX(${(1 - activeIndex) * (isDesktop ? 344 : 296)}px)`,
                  }}
                >
                  {testimonials.map((t, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <div
                        key={t.name}
                        onClick={() => setActiveIndex(index)}
                        className={`cursor-pointer transition-all duration-500 ease-in-out flex-shrink-0 w-[280px] md:w-[320px] bg-[#2D2D2D] rounded-lg p-6 flex flex-col border ${
                          isActive
                            ? "border-[#D2B48C] shadow-xl z-10"
                            : "border-transparent opacity-40 hover:opacity-60"
                        }`}
                        style={{
                          transform: isActive ? "scale(1.05)" : "scale(0.85)",
                        }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-[#725A39] rounded-full flex items-center justify-center font-body font-bold text-white flex-shrink-0">
                            {t.name[0]}
                          </div>
                          <div>
                            <div className="font-body font-bold text-white text-sm">{t.name}</div>
                            <div className="font-body text-xs text-[#D2B48C]">{t.city}</div>
                          </div>
                          <div className="ml-auto flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <IconStar key={i} className="w-3.5 h-3.5 text-[#D2B48C]" />
                            ))}
                          </div>
                        </div>
                        <p className="font-body text-sm text-[#D1C5B8] leading-relaxed mb-4 flex-1 h-20 overflow-y-auto">
                          &ldquo;{t.text}&rdquo;
                        </p>
                        <div className="bg-[#1B1C1C] rounded-sm px-4 py-2 flex items-center justify-between mt-auto">
                          <span className="font-body text-xs text-[#D2B48C]">Total didapat</span>
                          <span className="font-body font-bold text-white">{t.earned}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Button */}
              <button
                onClick={() => setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                className="w-10 h-10 rounded-full border border-[#D2B48C] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#1B1C1C] flex items-center justify-center transition-colors font-bold focus:outline-none z-20"
              >
                &rarr;
              </button>
            </div>

            {/* Dots indicator */}
            <div className="flex gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === activeIndex ? "bg-[#D2B48C]" : "bg-gray-600 hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#1B1C1C] mb-4">
          Yuk, Bersihkan Rumah<br />
          <span className="text-[#725A39]">Sambil Dapat Uang.</span>
        </h2>
        <p className="font-body text-[#4D453C] mb-8 max-w-sm mx-auto">
          Gratis daftar. Tidak ada biaya di muka. Komisi hanya diambil setelah barang laku.
        </p>
        <Link
          href="/jual"
          className="bg-[#725A39] hover:bg-[#5B4526] text-white font-body font-bold px-12 py-5 rounded-sm text-xl inline-block transition-colors shadow-sm"
        >
          Mulai Jual Sekarang
        </Link>
        <p className="font-body text-xs text-[#7F766A] mt-4">Proses 100% tanpa repot.</p>
      </section>
    </div>
  );
}

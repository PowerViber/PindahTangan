"use client";
import { useState } from "react";
import { IconFilter } from "../components/Icons";

interface Product {
  id: string;
  name: string;
  grade: "MINT" | "GOOD" | "FAIR";
  price: string;
  image: string;
  desc: string;
  specs: string[];
  conditionDesc: string;
}

const products: Product[] = [
  {
    id: "macbook-pro-16",
    name: 'MacBook Pro 16" (2021)',
    grade: "MINT",
    price: "Rp27.000.000",
    image: "/macbook.png",
    desc: "MacBook Pro 16 inci dengan chip Apple M1 Pro, RAM 16GB, dan SSD 512GB. Performa monster untuk editing video, programming, dan pengerjaan berat tanpa kendala.",
    specs: ["Chip M1 Pro (10-core CPU, 16-core GPU)", "RAM 16GB Unified Memory", "Storage SSD 512GB", "Layar 16.2-inch Liquid Retina XDR", "Sistem Operasi macOS Sequoia"],
    conditionDesc: "Sangat mulus tanpa bekas goresan (Grade MINT), battery health 92%, fungsi 100% normal. Box dan charger original lengkap."
  },
  {
    id: "apple-watch-8",
    name: "Apple Watch Series 8, 45mm",
    grade: "GOOD",
    price: "Rp4.200.000",
    image: "/applewatch.png",
    desc: "Smartwatch Apple Series 8 ukuran 45mm, GPS only. Memiliki sensor suhu tubuh, pengukur kadar oksigen darah, dan fitur crash detection.",
    specs: ["Ukuran layar 45mm", "Konektivitas GPS Only", "Always-On Retina display", "Warna Midnight Aluminum Case", "Strap Midnight Sport Band"],
    conditionDesc: "Kondisi fisik 90% (Grade GOOD), terdapat bekas pemakaian minor di bezel. Layar bersih terpasang tempered glass, battery health 87%. Fungsi lancar jaya, kabel charger magnetic bawaan tersedia."
  },
  {
    id: "iphone-12-pro-max",
    name: "iPhone 12 Pro Max, 256GB",
    grade: "FAIR",
    price: "Rp6.800.000",
    image: "/iphone.png",
    desc: "iPhone 12 Pro Max dengan kapasitas penyimpanan 256GB. Layar super besar 6.7 inci dengan kamera triple 12MP yang sangat mumpuni untuk fotografi malam.",
    specs: ["Kapasitas 256GB", "Layar 6.7-inch Super Retina XDR", "Chip A14 Bionic", "Triple Camera 12MP dengan LiDAR", "Warna Pacific Blue"],
    conditionDesc: "Kondisi fisik 80% (Grade FAIR) karena goresan halus di sisi samping (bezel) akibat pemakaian softcase keras. Layar dan panel belakang mulus, battery health 82%. Semua fitur (FaceID, kamera, speaker) berjalan normal. Unit Only."
  },
  {
    id: "sony-wh-1000xm4",
    name: "Sony WH-1000XM4",
    grade: "GOOD",
    price: "Rp3.300.000",
    image: "/sonyheadphones.png",
    desc: "Headphone wireless Over-Ear Noise-Cancelling legendaris dari Sony. Suara premium dengan fitur Smart Listening yang secara otomatis mendeteksi aktivitas Anda.",
    specs: ["Koneksi Bluetooth & NFC", "Baterai tahan hingga 30 jam", "Fitur Speak-to-Chat", "Active Noise Cancelling (ANC)", "Warna Hitam Matte"],
    conditionDesc: "Fisik mulus 88% (Grade GOOD), bantalan telinga (earpads) bersih tidak mengelupas. ANC aktif sangat sunyi, baterai sangat awet. Dilengkapi dengan carrying case bawaan dan kabel jack audio 3.5mm."
  },
  {
    id: "ipad-air-2022",
    name: "iPad Air (2022)",
    grade: "MINT",
    price: "Rp5.900.000",
    image: "/ipad.png",
    desc: "iPad Air Generasi ke-5 dengan chip Apple M1. Ringan, tipis, sangat kencang. Cocok untuk kuliah, menggambar, hingga bermain game berat.",
    specs: ["Chip Apple M1", "Kapasitas 64GB", "Layar 10.9-inch Liquid Retina", "Kamera Depan 12MP Ultra Wide (Center Stage)", "Warna Blue (Biru)"],
    conditionDesc: "Kondisi fisik 98% (Grade MINT) seperti baru. Jarang dipakai, layar bebas dari scratch, fungsi layar sentuh aman, FaceID/TouchID aktif. Charger type C original lengkap beserta box asli."
  },
  {
    id: "canon-eos-m50-mark-ii",
    name: "Canon EOS M50 Mark II",
    grade: "GOOD",
    price: "Rp8.100.000",
    image: "/canoncamera.png",
    desc: "Kamera Mirrorless Canon EOS M50 Mark II, favorit para content creator dan vlogger. Dilengkapi lensa kit 15-45mm IS STM. Mendukung video 4K dan live streaming vertikal.",
    specs: ["Sensor CMOS APS-C 24.1MP", "Prosesor gambar DIGIC 8", "Layar sentuh Vari-angle LCD", "Lensa Kit EF-M 15-45mm IS STM", "Konektivitas Wi-Fi & Bluetooth"],
    conditionDesc: "Kondisi barang 92% (Grade GOOD). Lensa bersih bebas jamur dan fog, autofocus cepat dan presisi. Body mulus dengan scratch kecil di bawah plate. Termasuk baterai original, charger, strap, dan tas kamera."
  },
];

const gradeStyle: Record<Product["grade"], string> = {
  MINT: "bg-[#1B1C1C] text-white",
  GOOD: "bg-[#D2B48C] text-[#5B4526] border border-[#5B4526]",
  FAIR: "bg-[#E8E2D9] text-[#1B1C1C] border border-[#D1C5B8]",
};

export default function MarketplacePage() {
  const [sort, setSort] = useState("Newest");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-20 py-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="flex flex-col gap-1 max-w-xl">
          <h1 className="font-serif text-3xl font-semibold text-[#1B1C1C]">Verified Electronics Marketplace</h1>
          <p className="font-sans text-base text-[#4D453C]">
            Curated, certified, and ready for a second life. Every item inspected by our team.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-1.5 border border-[#D1C5B8] rounded-full px-4 py-2 text-sm font-body font-medium text-[#1B1C1C] hover:bg-white transition-colors">
            <IconFilter className="w-3.5 h-3.5" />
            Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-[#D1C5B8] rounded-full px-4 py-2 text-sm font-body font-medium text-[#1B1C1C] bg-white focus:outline-none"
          >
            <option>Sort: Newest</option>
            <option>Sort: Price Low</option>
            <option>Sort: Price High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <article key={p.name} className="bg-white border border-[#E8E2D9] rounded-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-[#FBF9F8] p-6">
                <div className="relative bg-[#F6F3F2] border border-[#D1C5B8] rounded-sm h-52 overflow-hidden flex items-center justify-center">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="object-contain max-h-48 w-full p-4 transition-transform duration-300 hover:scale-105"
                  />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-sm ${gradeStyle[p.grade]}`}>
                    {p.grade}
                  </span>
                </div>
              </div>
              <div className="px-6 pb-2">
                <h2 className="font-serif text-xl font-medium text-[#1B1C1C] leading-snug">{p.name}</h2>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2 flex flex-col gap-3">
              <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D9]">
                <span className="font-body text-xl font-bold text-[#1B1C1C]">{p.price}</span>
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-medium text-sm px-4 py-2 rounded-sm transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center mt-12">
        <button className="border border-[#1B1C1C] text-[#1B1C1C] hover:bg-white px-8 py-3 rounded-sm font-body font-medium text-sm transition-colors">
          Load More Inventory
        </button>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl relative animate-in fade-in zoom-in duration-300">
            {/* Close Button top-right */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              &times;
            </button>

            {/* Left: Product Image */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-white border-r border-[#D1C5B8] items-center justify-center min-h-[300px]">
              <span className={`self-start mb-4 text-[10px] font-bold px-3.5 py-1.5 rounded-sm ${gradeStyle[selectedProduct.grade]}`}>
                KONDISI: {selectedProduct.grade}
              </span>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="object-contain max-h-[320px] w-full p-4"
              />
            </div>

            {/* Right: Detailed Info */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col gap-5 justify-between">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1B1C1C] leading-snug">
                    {selectedProduct.name}
                  </h2>
                  <div className="font-body text-2xl font-bold text-[#725A39] mt-2">
                    {selectedProduct.price}
                  </div>
                </div>

                <p className="font-sans text-sm text-[#4D453C] leading-relaxed">
                  {selectedProduct.desc}
                </p>

                <div>
                  <h3 className="font-body text-xs font-bold text-[#1B1C1C] uppercase tracking-wider mb-2">
                    Spesifikasi Utama
                  </h3>
                  <ul className="list-disc pl-4 text-xs font-sans text-[#4D453C] flex flex-col gap-1.5">
                    {selectedProduct.specs.map((spec, i) => (
                      <li key={i}>{spec}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#F6F3F2] border border-[#D1C5B8] rounded-sm p-4 flex flex-col gap-1.5">
                  <span className="font-body text-xs font-bold text-[#725A39] uppercase tracking-wider">
                    Catatan QC &amp; Fisik
                  </span>
                  <p className="font-sans text-xs text-[#4D453C] leading-relaxed">
                    {selectedProduct.conditionDesc}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => alert(`Pembelian ${selectedProduct.name} diproses! Terimakasih telah bertransaksi.`)}
                  className="flex-1 bg-[#725A39] hover:bg-[#5B4526] text-white font-body font-bold text-sm py-4 rounded-sm transition-colors text-center"
                >
                  Beli Sekarang
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 border border-[#D1C5B8] hover:border-[#725A39] hover:text-[#725A39] text-[#4D453C] font-body font-semibold text-sm py-4 rounded-sm transition-colors text-center"
                >
                  Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconShield, IconUpload } from "../components/Icons";

const promiseItems = [
  { title: "White-Glove Pickup",    desc: "Scheduled at your convenience." },
  { title: "Technical Inspection",  desc: "Rigorous 50-point quality check." },
  { title: "Studio Photography",    desc: "Presenting your item at its best." },
];

export default function SellerPanelPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    productName: "",
    purchaseYear: "",
    condition: "",
    functionality: "",
    completeness: "",
    address: "",
    contact: "",
  });

  function update(field: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/jual/estimasi");
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-20 py-10">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Form area */}
        <div className="flex-1 flex flex-col gap-12">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-3xl font-semibold text-[#1B1C1C]">Submit Electronics</h1>
            <p className="font-sans text-lg text-[#4D453C]">Begin the verification process for your second-hand devices.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-[#E8E2D9] rounded-lg p-12 flex flex-col gap-12">
            <div className="flex flex-col gap-3">
              <label className="font-sans text-sm font-medium text-[#4D453C]">Product Name</label>
              <input
                type="text"
                required
                value={form.productName}
                onChange={(e) => update("productName", e.target.value)}
                placeholder="e.g., Apple MacBook Pro M2 14-inch"
                className="font-sans border border-[#D1C5B8] rounded-sm px-4 py-3 text-lg placeholder-[#4D453C]/60 focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="font-sans text-sm font-medium text-[#4D453C]">Purchase Year</label>
              <input
                type="text"
                value={form.purchaseYear}
                onChange={(e) => update("purchaseYear", e.target.value)}
                placeholder="YYYY"
                maxLength={4}
                className="font-sans border border-[#D1C5B8] rounded-sm px-4 py-3 text-lg w-32 placeholder-[#4D453C]/60 focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="font-sans text-sm font-medium text-[#4D453C]">Kondisi Fisik Saat Ini</label>
              <input
                type="text"
                required
                value={form.condition}
                onChange={(e) => update("condition", e.target.value)}
                placeholder="e.g., screen scratches, dents"
                className="font-sans border border-[#D1C5B8] rounded-sm px-4 py-3 text-lg placeholder-[#4D453C]/60 focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="font-sans text-sm font-medium text-[#4D453C]">Fungsionalitas</label>
              <input
                type="text"
                required
                value={form.functionality}
                onChange={(e) => update("functionality", e.target.value)}
                placeholder="e.g., battery health, button response"
                className="font-sans border border-[#D1C5B8] rounded-sm px-4 py-3 text-lg placeholder-[#4D453C]/60 focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="font-sans text-sm font-medium text-[#4D453C]">Kelengkapan</label>
              <input
                type="text"
                value={form.completeness}
                onChange={(e) => update("completeness", e.target.value)}
                placeholder="e.g., original box, charger, accessories"
                className="font-sans border border-[#D1C5B8] rounded-sm px-4 py-3 text-lg placeholder-[#4D453C]/60 focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="font-sans text-sm font-medium text-[#4D453C]">Alamat Penjemputan</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="e.g., Jl. Sudirman No. 12, Jakarta"
                className="font-sans border border-[#D1C5B8] rounded-sm px-4 py-3 text-lg placeholder-[#4D453C]/60 focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="font-sans text-sm font-medium text-[#4D453C]">Nomor Kontak</label>
              <input
                type="tel"
                required
                value={form.contact}
                onChange={(e) => update("contact", e.target.value)}
                placeholder="e.g., 0812-3456-7890"
                className="font-sans border border-[#D1C5B8] rounded-sm px-4 py-3 text-lg placeholder-[#4D453C]/60 focus:outline-none focus:border-[#725A39]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="font-sans text-sm font-medium text-[#4D453C] flex items-center gap-2">
                <IconUpload className="w-4 h-4 text-[#7F766A]" />
                Pre-Assessment Images
              </label>
              <div className="border border-[#D1C5B8] rounded-sm bg-white p-12 flex flex-col items-center text-center gap-2 cursor-pointer hover:bg-[#F6F3F2] transition-colors">
                <IconUpload className="w-7 h-7 text-[#7F766A]" />
                <span className="font-sans text-base text-[#1B1C1C]">Drag &amp; drop or click to upload</span>
                <span className="font-body text-xs font-bold text-[#4D453C]">
                  Our team will professionally inspect &amp; photograph your item upon pickup.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-bold text-base py-4 rounded-xl w-fit px-12 self-start transition-colors"
            >
              Request Professional Pickup
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-96">
          <div className="bg-[#F6F3F2] rounded-lg p-6 flex flex-col gap-3 sticky top-24">
            <h3 className="font-serif text-2xl font-medium text-[#1B1C1C] flex items-center gap-2">
              <IconShield className="w-5 h-5 text-[#725A39]" />
              The PindahTangan Promise
            </h3>
            <p className="font-sans text-base text-[#4D453C]">
              We handle the entire resale lifecycle, ensuring premium presentation and verified quality for every buyer.
            </p>
            <div className="flex flex-col gap-3 pl-3 mt-2">
              {promiseItems.map((p) => (
                <div key={p.title} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D2B48C] mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-body text-sm font-bold text-[#1B1C1C]">{p.title}</div>
                    <div className="font-body text-sm text-[#4D453C]">{p.desc}</div>
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

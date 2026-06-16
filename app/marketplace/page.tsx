"use client";
import { useState } from "react";
import { IconFilter, IconShield } from "../components/Icons";

interface Product {
  name: string;
  grade: "MINT" | "GOOD" | "FAIR";
  price: string;
}

const products: Product[] = [
  { name: "MacBook Pro 16\" (2021)", grade: "MINT", price: "$1,800" },
  { name: "Apple Watch Series 8, 45mm", grade: "GOOD", price: "$280" },
  { name: "iPhone 12 Pro Max, 256GB", grade: "FAIR", price: "$450" },
  { name: "Sony WH-1000XM4", grade: "GOOD", price: "$220" },
  { name: "iPad Air (2022)", grade: "MINT", price: "$390" },
  { name: "Canon EOS M50 Mark II", grade: "GOOD", price: "$540" },
];

const gradeStyle: Record<Product["grade"], string> = {
  MINT: "bg-[#1B1C1C] text-white",
  GOOD: "bg-[#D2B48C] text-[#5B4526] border border-[#5B4526]",
  FAIR: "bg-[#E8E2D9] text-[#1B1C1C] border border-[#D1C5B8]",
};

export default function MarketplacePage() {
  const [sort, setSort] = useState("Newest");

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
          <article key={p.name} className="bg-white border border-[#E8E2D9] rounded-sm overflow-hidden">
            <div className="bg-[#FBF9F8] p-6">
              <div className="relative bg-[#F6F3F2] border border-[#D1C5B8] rounded-sm h-52 flex items-center justify-center text-[#A89070] text-xs">
                Foto Produk
                <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-sm ${gradeStyle[p.grade]}`}>
                  {p.grade}
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <h2 className="font-serif text-xl font-medium text-[#1B1C1C]">{p.name}</h2>
              <div className="bg-[#FEDDB3] rounded-sm px-2 py-1.5 flex items-center gap-1.5 w-fit">
                <IconShield className="w-3.5 h-3.5 text-[#725A39]" />
                <span className="font-body text-sm font-medium text-[#725A39]">Verified by PindahTangan</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-body text-2xl font-bold text-[#1B1C1C]">{p.price}</span>
                <button className="bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-medium text-sm px-4 py-2 rounded-sm transition-colors">
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
    </div>
  );
}

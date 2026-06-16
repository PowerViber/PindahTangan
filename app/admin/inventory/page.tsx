"use client";
import { useState } from "react";
import { IconSearch, IconBox } from "../../components/Icons";

interface Row {
  id: string;
  name: string;
  category: string;
  grade: "A" | "B" | "C";
  status: string;
  statusColor: string;
  date: string;
}

const rows: Row[] = [
  { id: "#PT-2024-89A",  name: "MacBook Pro 16\" 2021", category: "Laptop", grade: "A", status: "Listed",   statusColor: "#D2B48C", date: "Oct 12, 2024" },
  { id: "#PT-2024-92B",  name: "iPhone 13 Pro",          category: "Phone",  grade: "B", status: "In QC",    statusColor: "#7F766A", date: "Oct 14, 2024" },
  { id: "#PT-2024-105C", name: "Sony WH-1000XM4",        category: "Audio",  grade: "C", status: "Pending",  statusColor: "#E4E2E1", date: "Oct 10, 2024" },
  { id: "#PT-2024-112A", name: "iPad Air (2022)",        category: "Tablet", grade: "A", status: "Listed",   statusColor: "#D2B48C", date: "Oct 15, 2024" },
];

const gradeStyle: Record<Row["grade"], string> = {
  A: "bg-[#1B1C1C] text-white",
  B: "bg-[#D2B48C] text-[#5B4526] border border-[#D1C5B8]",
  C: "bg-[#E4E2E1] text-[#1B1C1C] border border-[#D1C5B8]",
};

export default function InventoryPage() {
  const [category, setCategory] = useState("All Categories");
  const categories = ["All Categories", ...Array.from(new Set(rows.map((r) => r.category)))];
  const filtered = category === "All Categories" ? rows : rows.filter((r) => r.category === category);

  return (
    <div className="px-12 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-5xl font-semibold text-[#1B1C1C] mb-2">Inventory Directory</h1>
          <p className="font-sans text-base text-[#4D453C]">Manage, filter, and track verified electronic assets.</p>
        </div>
        <div className="flex gap-3">
          <button className="border border-[#7F766A] rounded-sm px-6 py-3 text-sm font-body font-medium text-[#1B1C1C]">
            Bulk Export
          </button>
          <button className="bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] rounded-sm px-6 py-3 text-sm font-body font-medium transition-colors">
            Add New Item
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#D1C5B8] rounded-lg p-3 flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[260px]">
          <IconSearch className="w-4 h-4 text-[#4D453C] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Item ID, Product Name, or Category..."
            className="w-full border border-[#D1C5B8] rounded-sm pl-12 pr-4 py-3 text-sm font-body placeholder-[#7F766A] focus:outline-none focus:border-[#725A39]"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-[#D1C5B8] bg-[#FBF9F8] rounded-sm px-4 py-3 text-sm font-body font-medium text-[#1B1C1C] focus:outline-none"
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="border border-[#D1C5B8] bg-[#FBF9F8] rounded-sm px-4 py-3 text-sm font-body font-medium text-[#1B1C1C] focus:outline-none">
          <option>All Grades</option>
          <option>Grade A</option>
          <option>Grade B</option>
          <option>Grade C</option>
        </select>
      </div>

      <div className="bg-white border border-[#D1C5B8] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F6F3F2] border-b border-[#D1C5B8] text-left">
              <th className="px-4 py-3 w-12"><input type="checkbox" className="accent-[#7F766A]" /></th>
              <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Item ID</th>
              <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Product Name</th>
              <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Category</th>
              <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Condition Grade</th>
              <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Current Status</th>
              <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Acquisition Date</th>
              <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-[#D1C5B8] last:border-0 hover:bg-[#FBF9F8] transition-colors">
                <td className="px-4 py-4"><input type="checkbox" className="accent-[#7F766A]" /></td>
                <td className="px-4 py-4 font-body font-medium text-[#1B1C1C]">{r.id}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E4E2E1] border border-[#D1C5B8] rounded-sm flex items-center justify-center flex-shrink-0">
                      <IconBox className="w-4 h-4 text-[#7F766A]" />
                    </div>
                    <span className="font-body text-[#1B1C1C]">{r.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 font-body text-[#4D453C]">{r.category}</td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-sm ${gradeStyle[r.grade]}`}>Grade {r.grade}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="flex items-center gap-1.5 font-body text-[#1B1C1C]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.statusColor }} />
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-4 font-body text-[#4D453C]">{r.date}</td>
                <td className="px-4 py-4">
                  <button className="text-[#1B1C1C] font-bold">⋯</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-[#F6F3F2] border-t border-[#D1C5B8] px-4 py-3 flex items-center justify-between">
          <span className="font-body text-xs font-bold text-[#4D453C]">Showing 1-{filtered.length} of 124 Items</span>
          <div className="flex gap-1">
            <button className="w-6 h-6 border border-[#D1C5B8] rounded-sm flex items-center justify-center text-[#1B1C1C] text-xs">‹</button>
            <button className="w-6 h-6 border border-[#D1C5B8] rounded-sm flex items-center justify-center text-[#1B1C1C] text-xs">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

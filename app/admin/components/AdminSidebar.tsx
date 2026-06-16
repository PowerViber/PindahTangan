"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconChart, IconBox, IconRoute, IconSearch, IconTrendingUp, IconBolt,
} from "../../components/Icons";

const navItems = [
  { href: "/admin",            label: "Overview",   Icon: IconChart },
  { href: "/admin/inventory",  label: "Inventory",   Icon: IconBox },
  { href: "/admin/qc",         label: "QC Queue",    Icon: IconSearch },
  { href: "/admin/logistics",  label: "Logistics",   Icon: IconRoute },
  { href: "/admin/analytics",  label: "Analytics",   Icon: IconTrendingUp },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#F6F3F2] border-r border-[#D1C5B8] min-h-screen py-6 px-6 flex flex-col">
      <div className="mb-12">
        <h1 className="font-serif text-2xl font-medium text-[#1B1C1C]">PindahTangan</h1>
        <p className="font-body text-xs font-bold text-[#4D453C] tracking-wide">REFINED LOGISTICS</p>
      </div>

      <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-sm p-3 flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-[#D2B48C] rounded-xl flex items-center justify-center font-body font-bold text-sm text-[#5B4526] flex-shrink-0">
          OL
        </div>
        <div>
          <div className="font-body text-sm font-bold text-[#1B1C1C]">Admin Console</div>
          <div className="font-body text-xs text-[#4D453C]">Operations Lead</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors ${
                active ? "bg-[#D2B48C] text-[#5B4526] font-bold" : "text-[#4D453C] font-medium hover:bg-[#FBF9F8]"
              }`}
            >
              <item.Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button className="bg-[#725A39] hover:bg-[#5B4526] text-white rounded-sm py-3 flex items-center justify-center gap-2 font-body font-bold text-sm transition-colors">
        <IconBolt className="w-3.5 h-3.5" />
        New Inspection
      </button>
    </aside>
  );
}

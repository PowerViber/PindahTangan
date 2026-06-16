"use client";
import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  Icon: React.ComponentType<{ className?: string }>;
}

export default function StatCard({ label, value, Icon }: StatCardProps) {
  return (
    <div className="bg-white border border-[#D1C5B8] hover:border-[#725A39] rounded-xl p-6 flex flex-col gap-3 transition-all duration-300 shadow-xs hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs font-bold text-[#4D453C] tracking-wider uppercase">{label}</span>
        <Icon className="w-5 h-5 text-[#725A39]" />
      </div>
      <div className="font-serif text-3xl font-semibold text-[#1B1C1C] tracking-tight">{value}</div>
    </div>
  );
}

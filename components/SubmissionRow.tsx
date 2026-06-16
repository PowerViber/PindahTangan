"use client";
import React from "react";
import { formatIDR } from "./ProductCard";

interface Submission {
  id: string;
  product_name: string;
  estimation_price: number | string | null;
  status: "PENDING" | "ACTIVE" | "SOLD" | "CANCELLED" | string;
  image_url?: string | null;
  created_at: string;
}

interface SubmissionRowProps {
  submission: Submission;
}

const statusBadgeStyles: Record<string, string> = {
  PENDING: "bg-[#FEDDB3] text-[#725A39] border border-[#725A39]/30",
  ACTIVE: "bg-green-50 text-green-700 border border-green-200",
  SOLD: "bg-[#1B1C1C] text-white",
  CANCELLED: "bg-red-50 text-red-700 border border-red-200",
};

export default function SubmissionRow({ submission }: SubmissionRowProps) {
  const displayStatus = (submission.status || "PENDING").toUpperCase();
  const badgeClass = statusBadgeStyles[displayStatus] || statusBadgeStyles.PENDING;
  const formattedDate = new Date(submission.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-[#E8E2D9] hover:border-[#D1C5B8] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-[#F6F3F2] border border-[#D1C5B8] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-[#A89070] text-[10px]">
          {submission.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={submission.image_url}
              alt={submission.product_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-6 h-6 text-[#A89070]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div>
          <h4 className="font-serif text-base font-semibold text-[#1B1C1C] line-clamp-1">{submission.product_name}</h4>
          <span className="font-mono text-xs text-[#7F766A]">{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F5F3F3]">
        <div className="text-left sm:text-right">
          <div className="font-body text-xs text-[#7F766A]">Estimasi Nilai</div>
          <div className="font-body text-base font-bold text-[#1B1C1C]">
            {submission.estimation_price ? formatIDR(submission.estimation_price) : "-"}
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-xs tracking-wider ${badgeClass}`}>
          {displayStatus}
        </span>
      </div>
    </div>
  );
}

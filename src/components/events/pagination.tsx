"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const searchParams = useSearchParams();
  
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    return `/events?${params.toString()}`;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
      <div className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{startItem}</span> to{" "}
        <span className="font-semibold text-slate-900">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalItems}</span> events
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={createPageUrl(currentPage - 1)}
          className={`flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            currentPage === 1
              ? "cursor-not-allowed border-slate-200 text-slate-400"
              : "border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          }`}
          aria-disabled={currentPage === 1}
          onClick={(e) => {
            if (currentPage === 1) {
              e.preventDefault();
            }
          }}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Link>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm text-slate-400"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Link
                key={pageNum}
                href={createPageUrl(pageNum)}
                className={`flex size-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        <Link
          href={createPageUrl(currentPage + 1)}
          className={`flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            currentPage === totalPages
              ? "cursor-not-allowed border-slate-200 text-slate-400"
              : "border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          }`}
          aria-disabled={currentPage === totalPages}
          onClick={(e) => {
            if (currentPage === totalPages) {
              e.preventDefault();
            }
          }}
        >
          Next
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}


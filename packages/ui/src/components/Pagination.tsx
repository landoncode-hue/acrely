import React from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Show page size selector */
  showPageSize?: boolean;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Current page size */
  pageSize?: number;
  /** Page size change handler */
  onPageSizeChange?: (size: number) => void;
  /** Sibling count (pages shown around current) */
  siblingCount?: number;
}

/**
 * Pagination component for navigating through pages
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={page}
 *   totalPages={10}
 *   onPageChange={setPage}
 * />
 * ```
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageSize = false,
  pageSizeOptions = [10, 20, 50, 100],
  pageSize = 10,
  onPageSizeChange,
  siblingCount = 1,
}) => {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    // Always show first page
    pages.push(1);

    // Show dots if there's a gap
    if (leftSibling > 2) {
      pages.push("...");
    }

    // Show pages around current
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Show dots if there's a gap
    if (rightSibling < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Page info */}
      <div className="text-sm text-neutral-600">
        Page {currentPage} of {totalPages}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            "p-2 rounded-lg border transition-colors",
            currentPage === 1
              ? "border-neutral-200 text-neutral-400 cursor-not-allowed"
              : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) =>
            typeof page === "number" ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={clsx(
                  "min-w-[2.5rem] px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  page === currentPage
                    ? "bg-primary-600 text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                )}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            ) : (
              <span
                key={index}
                className="px-3 py-2 text-sm text-neutral-400"
                aria-hidden="true"
              >
                {page}
              </span>
            )
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            "p-2 rounded-lg border transition-colors",
            currentPage === totalPages
              ? "border-neutral-200 text-neutral-400 cursor-not-allowed"
              : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          )}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Page size selector */}
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-neutral-600">
            Per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

Pagination.displayName = "Pagination";

/**
 * hooks/usePagination.ts
 * Manages pagination state for table/list views.
 */

import { useCallback, useState } from "react";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/app";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToNextPage: () => void;
  goToPrevPage: (currentPage: number) => void;
  resetPagination: () => void;
}

export function usePagination({
  initialPage = DEFAULT_PAGE,
  initialPageSize = DEFAULT_PAGE_SIZE,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); // Reset to page 1 when changing page size
  }, []);

  const goToFirstPage = useCallback(() => setPage(1), []);

  const goToNextPage = useCallback(() => setPage((p) => p + 1), []);

  const goToPrevPage = useCallback(
    (currentPage: number) => setPage(Math.max(1, currentPage - 1)),
    []
  );

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    page,
    pageSize,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    goToFirstPage,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  };
}

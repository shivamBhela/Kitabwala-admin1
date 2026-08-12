import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Download,
} from 'lucide-react';
import { staggerContainer, slideUp } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { TableRowSkeleton } from '@/components/ui/skeleton';

/** Raw, comparable/serializable value behind a column — used for sort, CSV export, and column filters. */
type CellValue = string | number | boolean | null | undefined;

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  width?: string;
  /**
   * Raw underlying value for this column, distinct from `cell` (which may return JSX).
   * Powers sorting, CSV export, and column filtering — required for a column to
   * participate in any of those; columns without it still render fine, they just
   * export a blank CSV value and can't be sorted/filtered.
   */
  accessor?: (item: T) => CellValue;
  /** Click-to-sort on this column's header. No-op unless `accessor` is also set. */
  sortable?: boolean;
  /** Renders a small per-column filter input under the header. No-op unless `accessor` is also set. */
  filterable?: boolean;
  /** Header + cell text alignment. Defaults to 'left'. */
  align?: 'left' | 'center' | 'right';
}

interface UniversalTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  /** Externally-controlled pagination (e.g. server-paged data). Omit to let the table paginate itself. */
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  /** Rows per page when pagination is self-managed (i.e. `onPageChange` isn't passed). Default 10. */
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  /** Makes rows clickable — adds hover/keyboard affordance and fires on click/Enter/Space. */
  onRowClick?: (item: T) => void;
  /** File name for the "Export CSV" download. Default 'export.csv'. */
  exportFileName?: string;
}

type SortDir = 'asc' | 'desc';

function compareValues(a: CellValue, b: CellValue): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function csvCell(value: CellValue): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCsv<T>(columns: ColumnDef<T>[], rows: T[], fileName: string) {
  const header = columns.map((c) => csvCell(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((col) => csvCell(col.accessor ? col.accessor(row) : '')).join(','))
    .join('\r\n');
  const csv = `${header}\r\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function alignClass(align?: ColumnDef<unknown>['align']): string {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
}

export function UniversalTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search...',
  searchQuery = '',
  onSearchChange,
  page = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  isLoading = false,
  emptyMessage = 'No data found.',
  onRowClick,
  exportFileName = 'export.csv',
}: UniversalTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');
  const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({});
  const [internalPage, setInternalPage] = React.useState(1);

  const isExternallyPaged = Boolean(onPageChange);
  const hasFilterableColumns = columns.some((c) => c.filterable && c.accessor);

  // Filter + sort the full dataset first, THEN paginate the result below —
  // never the other way around, or pagination would slice before the
  // filtered/sorted set is known.
  const processedData = React.useMemo(() => {
    let rows = data;

    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v.trim().length > 0);
    if (activeFilters.length > 0) {
      rows = rows.filter((row) =>
        activeFilters.every(([key, value]) => {
          const col = columns.find((c) => c.key === key);
          if (!col?.accessor) return true;
          return String(col.accessor(row) ?? '').toLowerCase().includes(value.toLowerCase());
        })
      );
    }

    if (sortKey) {
      const sortCol = columns.find((c) => c.key === sortKey);
      if (sortCol?.accessor) {
        const accessor = sortCol.accessor;
        rows = [...rows].sort((a, b) => compareValues(accessor(a), accessor(b)));
        if (sortDir === 'desc') rows.reverse();
      }
    }

    return rows;
  }, [data, columns, columnFilters, sortKey, sortDir]);

  // Reset to page 1 whenever the active search/filter/sort changes, so the
  // user never lands on a stale, now-out-of-range page. Safe to call setState
  // during render here: it's guarded by the equality check, so it settles
  // after exactly one extra render (React's documented pattern for this).
  const resetSignature = `${searchQuery}__${JSON.stringify(columnFilters)}__${sortKey}__${sortDir}`;
  const [prevResetSignature, setPrevResetSignature] = React.useState(resetSignature);
  if (resetSignature !== prevResetSignature) {
    setPrevResetSignature(resetSignature);
    if (internalPage !== 1) setInternalPage(1);
  }

  const totalInternalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const currentInternalPage = Math.min(internalPage, totalInternalPages);

  const displayPage = isExternallyPaged ? page : currentInternalPage;
  const displayTotalPages = isExternallyPaged ? totalPages : totalInternalPages;

  const pagedData = isExternallyPaged
    ? processedData
    : processedData.slice((currentInternalPage - 1) * pageSize, currentInternalPage * pageSize);

  const goToPage = (target: number) => {
    if (isExternallyPaged) onPageChange?.(target);
    else setInternalPage(target);
  };

  const hasAnyRows = data.length > 0;
  const hasVisibleRows = pagedData.length > 0;
  const canExport = processedData.length > 0;
  const hasActiveColumnFilters = Object.values(columnFilters).some((v) => v.trim().length > 0);

  const handleSort = (col: ColumnDef<T>) => {
    if (!col.sortable || !col.accessor) return;
    if (sortKey !== col.key) {
      setSortKey(col.key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
    }
  };

  return (
    <div className="kw-card p-0 overflow-hidden flex flex-col w-full h-full">
      {/* Toolbar: search + export */}
      <div className="p-4 border-b border-[#FFD40030] bg-[#FFFDF0] flex flex-wrap items-center justify-between gap-3">
        {onSearchChange ? (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-(--yellow) bg-white shadow-sm"
            />
          </div>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => downloadCsv(columns, processedData, exportFileName)}
          disabled={!canExport}
          title="Export the currently filtered rows as CSV"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Table content — scrolls both axes; header stays pinned to the top of this box. */}
      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
          <thead className="sticky top-0 z-10 bg-[#FFFDF0] text-slate-600 font-semibold border-b border-[#FFD40030]">
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn('px-4 py-3 align-middle', alignClass(col.align))}
                    style={{ width: col.width }}
                  >
                    {col.sortable && col.accessor ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col)}
                        className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                      >
                        {col.header}
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-[#92660A]" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-[#92660A]" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
            {hasFilterableColumns && (
              <tr className="border-t border-[#FFD40030]">
                {columns.map((col) => (
                  <th
                    key={`filter-${col.key}`}
                    className="px-4 pb-3 align-middle font-normal"
                    style={{ width: col.width }}
                  >
                    {col.filterable && col.accessor ? (
                      <input
                        type="text"
                        value={columnFilters[col.key] ?? ''}
                        onChange={(e) =>
                          setColumnFilters((prev) => ({ ...prev, [col.key]: e.target.value }))
                        }
                        placeholder={`Filter ${col.header.toLowerCase()}…`}
                        className="w-full px-2 py-1.5 text-xs font-normal rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-(--yellow) bg-white"
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="divide-y divide-slate-100 bg-white"
          >
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
                <TableRowSkeleton key={i} columns={columns.length} />
              ))
            ) : !hasVisibleRows ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState
                    icon={hasAnyRows ? Search : undefined}
                    title={hasAnyRows ? 'No matching results' : emptyMessage}
                    description={
                      hasAnyRows ? 'Try adjusting your search, filters, or sort order.' : undefined
                    }
                    action={
                      hasAnyRows && hasActiveColumnFilters ? (
                        <button
                          type="button"
                          onClick={() => setColumnFilters({})}
                          className="text-xs font-semibold text-[#92660A] hover:underline"
                        >
                          Clear column filters
                        </button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              pagedData.map((item) => (
                <motion.tr
                  variants={slideUp}
                  key={keyExtractor(item)}
                  role="row"
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(item);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    'even:bg-slate-50/60 dark:even:bg-slate-800/30 hover:bg-amber-50/70 transition-colors',
                    onRowClick &&
                      'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--yellow)'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 align-middle', alignClass(col.align))}>
                      {col.cell(item)}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>

      {/* Pagination */}
      {displayTotalPages > 1 && (
        <div className="p-4 border-t border-[#FFD40030] bg-[#FFFDF0] flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-slate-500">
            Page <span className="font-bold text-slate-700">{displayPage}</span> of {displayTotalPages}
            {!isExternallyPaged && (
              <span className="hidden sm:inline"> · {processedData.length} total</span>
            )}
          </span>
          <div className="flex gap-2">
            <button
              disabled={displayPage === 1}
              onClick={() => goToPage(displayPage - 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={displayPage === displayTotalPages}
              onClick={() => goToPage(displayPage + 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

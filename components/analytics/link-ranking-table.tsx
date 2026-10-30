"use client";

import { getIconComponent } from "@/lib/icons";
import type { LinkClickData } from "@/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Sparkline } from "./sparkline";
import { TrendBadge } from "./trend-badge";

interface LinkRankingTableProps {
  data: LinkClickData[];
  locale?: string;
}

const columnHelper = createColumnHelper<LinkClickData>();

export function LinkRankingTable({
  data,
  locale = "pt-BR",
}: LinkRankingTableProps) {
  "use no memo";
  const [sorting, setSorting] = useState<SortingState>([
    { id: "clicks", desc: true },
  ]);

  const columns = [
    columnHelper.display({
      id: "rank",
      header: "#",
      cell: (info) => (
        <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
          {info.row.index + 1}
        </span>
      ),
      size: 32,
    }),
    columnHelper.accessor("label", {
      header: "Link",
      cell: (info) => {
        const Icon = getIconComponent(info.row.original.icon);
        return (
          <div className="flex items-center gap-2.5">
            <div className="border-hairline-strong bg-surface-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border">
              {Icon ? (
                <Icon className="text-ink-subtle h-3.5 w-3.5" />
              ) : (
                <ExternalLink className="text-ink-subtle h-3.5 w-3.5" />
              )}
            </div>
            <span className="text-ink truncate text-sm leading-[1.5]">
              {info.getValue()}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("clicks", {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="text-ink-subtle hover:text-ink flex min-h-10 items-center gap-1 rounded-lg text-xs leading-[1.5] font-medium tracking-normal"
        >
          {locale.startsWith("en") ? "Clicks" : "Cliques"}
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: (info) => (
        <span className="text-ink text-sm leading-[1.5] font-semibold">
          {info.getValue().toLocaleString(locale)}
        </span>
      ),
    }),
    columnHelper.accessor("ctr", {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="text-ink-subtle hover:text-ink flex min-h-10 items-center gap-1 rounded-lg text-xs leading-[1.5] font-medium tracking-normal"
        >
          CTR
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: (info) => (
        <span className="text-ink-subtle text-sm leading-[1.5]">
          {info.getValue().toLocaleString(locale)}%
        </span>
      ),
    }),
    columnHelper.display({
      id: "trend",
      header: locale.startsWith("en") ? "Trend" : "Tendência",
      cell: (info) => {
        const row = info.row.original;
        const trend =
          row.clicksPrevious > 0
            ? Math.round(
                ((row.clicks - row.clicksPrevious) / row.clicksPrevious) * 100,
              )
            : row.clicks > 0
              ? 100
              : 0;
        return <TrendBadge value={trend} />;
      },
    }),
    columnHelper.display({
      id: "sparkline",
      header: "",
      cell: (info) => {
        const row = info.row.original;
        const trend =
          row.clicksPrevious > 0
            ? (row.clicks - row.clicksPrevious) / row.clicksPrevious
            : 0;
        const points = [
          Math.max(row.clicksPrevious * 0.8, 1),
          row.clicksPrevious,
          Math.round((row.clicks + row.clicksPrevious) / 2),
          row.clicks * 0.9,
          row.clicks,
        ];
        return <Sparkline data={points} positive={trend >= 0} />;
      },
      size: 80,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
      <h2 className="text-ink mb-4 text-sm leading-[1.5] font-semibold">
        {locale.startsWith("en") ? "Link ranking" : "Ranking de links"}
      </h2>
      <div className="-mx-6 overflow-x-auto px-6">
        <table className="w-full min-w-[520px] tabular-nums">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-hairline-strong border-b"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-ink-subtle pb-3 text-left text-xs leading-[1.5] font-medium tracking-normal"
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-hairline/70 border-b transition-colors hover:bg-surface-2/60 last:border-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-4 pr-4 last:pr-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

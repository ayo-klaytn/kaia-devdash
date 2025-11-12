"use client"
 
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export type RepositoryRow = {
  id: string
  owner: string
  name: string
  url: string | null
  commitCount: number
  developerCount: number
  lastCommitAt: string | null
}

export const columns: ColumnDef<RepositoryRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="justify-start"
      >
        Repository
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex w-[420px] flex-col gap-1">
        <Link
          href={`/dashboard/github/${row.original.id}`}
          className="text-sm font-medium text-blue-500 underline underline-offset-4"
        >
          {row.original.name}
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{row.original.owner}</span>
          <Link
            href={row.original.url ?? `https://github.com/${row.original.owner}/${row.original.name}`}
            target="_blank"
            className="flex items-center gap-1 text-blue-500 underline underline-offset-4"
          >
            <ExternalLink className="h-3 w-3" />
            Open on GitHub
          </Link>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "commitCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="justify-start"
      >
        Commits
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.commitCount.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "developerCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="justify-start"
      >
        Developers
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.developerCount.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "lastCommitAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="justify-start"
      >
        Last Commit
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      if (!row.original.lastCommitAt) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      const date = new Date(row.original.lastCommitAt);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
]
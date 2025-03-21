"use client"
 
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Repository = {
  id: number
  repository: string
  owner: string
  contributors: string[]
}
 
export const columns: ColumnDef<Repository>[] = [
  {
    accessorKey: "repository",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Repository
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="w-[400px]">
          <Link
            href={`/dashboard/github/${row.original.owner}/${row.original.repository}`}
            className="text-blue-500 underline underline-offset-4"
          >
            {row.original.repository}
          </Link>
        </div>
      )
    }
  },
  {
    accessorKey: "owner",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Owner
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="w-[120px]">
          <Link
            href={`/dashboard/github/${row.original.owner}`}
            className="text-blue-500 underline underline-offset-4"
          >
            {row.original.owner}
          </Link>
        </div>
      )
    }
  },
  {
    accessorKey: "contributors",
    header: "Contributors",
    filterFn: (row, columnId, value) => {
      const contributors = row.getValue<string[]>(columnId);
      const searchTerm = String(value).toLowerCase();
      return contributors.some(contributor => 
        contributor.toLowerCase().includes(searchTerm)
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-1 w-full">
          {row.original.contributors.map((contributor) => (
            <Link
              key={contributor}
              href={`/dashboard/github/${contributor}`}
              className="inline-flex items-center rounded-md p-2 text-xs font-medium bg-secondary hover:bg-secondary/80 text-blue-500 underline underline-offset-4"
            >
              {contributor}
            </Link>
          ))}
        </div>
      );
    },
  },
]
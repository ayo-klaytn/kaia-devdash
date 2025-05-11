"use client"
 
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { developer } from "@/lib/db/schema"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Developer = typeof developer.$inferSelect
 
export const columns: ColumnDef<Developer>[] = [
  {
    accessorKey: "id",
    header: "ID"
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div>
          <Link
            href={`/dashboard/developers/${row.original.name}`}
            className="text-blue-500 underline underline-offset-4"
          >
            {row.original.name}
          </Link>
        </div>
      )
    }
  },
  {
    accessorKey: "communityRank",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Community Rank
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div>
          {row.original.communityRank}
        </div>
      )
    }
  },
]
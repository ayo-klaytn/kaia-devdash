"use client"
 
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { repository } from "@/lib/db/schema"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Repository = typeof repository.$inferSelect
 
export const columns: ColumnDef<Repository>[] = [
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
          Repository
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="w-[400px]">
          <Link
            target="_blank"
            href={`https://github.com/${row.original.owner}/${row.original.name}`}
            className="text-blue-500 underline underline-offset-4"
          >
            {row.original.name}
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
          Author
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="w-[120px]">
          <Link
            target="_blank"
            href={`https://github.com/${row.original.owner}`}
            className="text-blue-500 underline underline-offset-4"
          >
            {row.original.owner}
          </Link>
        </div>
      )
    }
  }
]
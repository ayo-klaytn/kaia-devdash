"use client"
 
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type DeveloperRepository = {
  id: number
  owner: string
  repository: string
  relations: string
}
 
export const columns: ColumnDef<DeveloperRepository>[] = [
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
            href={`https://github.com/${row.original.owner}/${row.original.repository}`}
            className="text-blue-500 underline underline-offset-4"
          >
            {row.original.repository}
          </Link>
        </div>
      )
    }
  },
  {
    accessorKey: "relations",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Relations
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="w-[120px]">
          {row.original.relations}
        </div>
      )
    }
  }
]
"use client"
 
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { slugify } from "@/lib/utils"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ProjectData = {
  id: number
  name: string
  description: string
  url: string
  twitter: string
  github: string
  repositories: {
    id: string
    url: string
  }[]
  dune_dashboard_urls: {
    id: string
    url: string
    description: string
    width: string
    height: string
  }[]
  categories: string[]
  community_rank: number
  maturity_rank: number
}

 
export const columns: ColumnDef<ProjectData>[] = [
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
        <div className="w-[400px]">
          <Link
            href={`/dashboard/projects/${slugify(row.original.name)}`}
            className="text-blue-500 underline underline-offset-4"
          >
            {row.original.name}
          </Link>
        </div>
      )
    }
  },
  {
    accessorKey: "categories",
    header: "Categories",
    filterFn: (row, columnId, value) => {
      const categories = row.getValue<string[]>(columnId);
      const searchTerm = String(value).toLowerCase();
      return categories.some(category => 
        category.toLowerCase().includes(searchTerm)
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-1 w-full">
          {row.original.categories.map((category) => (
            <p
              key={category}
              className="inline-flex items-center rounded-md p-2 text-xs font-medium bg-secondary hover:bg-secondary/80"
            >
              {category}
            </p>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "community_rank",
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
      return <p>{row.original.community_rank}</p>
    }
  },
  {
    accessorKey: "maturity_rank",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Maturity Rank
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <p>{row.original.maturity_rank}</p>
    }
  }
]
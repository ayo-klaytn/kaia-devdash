"use client"
 
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Developer = {
  id: number
  name: string
  repositories: {
    name: string
    owner: string
    commitCount: number
    lastCommitDate?: string
  }[]
  totalContributions: number
  totalCommits: number
}
 
export const columns: ColumnDef<Developer>[] = [
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
    accessorKey: "totalContributions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Contributions
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div>
          {row.original.totalContributions}
        </div>
      )
    }
  },
  {
    accessorKey: "totalCommits",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Commits
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div>
          {row.original.totalCommits}
        </div>
      )
    }
  },
  {
    accessorKey: "repositories",
    header: "Repositories",
    filterFn: (row, columnId, value) => {
      const repositories = row.getValue<string[]>(columnId);
      const searchTerm = String(value).toLowerCase();
      return repositories.some(repository => 
        repository.toLowerCase().includes(searchTerm)
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-1 w-full">
          {row.original.repositories.map((repository, index) => (
            <div
              key={index}
              className="inline-flex items-center rounded-md p-2 text-xs font-medium bg-secondary hover:bg-secondary/80"
            >
              {repository.name}
            </div>
          ))}
        </div>
      );
    },
  },
]
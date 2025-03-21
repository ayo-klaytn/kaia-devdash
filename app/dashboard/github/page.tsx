"use client";

import kaia from "@/lib/mocks/kaia.json"
import { Package, UserPen, Users } from "lucide-react";
import { Repository, columns } from "@/app/dashboard/github/columns"
import { DataTable } from "@/app/dashboard/github/data-table"
import { useMemo } from 'react';


export default function GitHub() {

  const data = useMemo(() => 
    kaia.repositories as Repository[],
    [] // Empty dependency array since kaia is static
  );

  const stats = useMemo(() => {
    const uniqueOwners = new Set(data.map(repo => repo.owner));
    const uniqueContributors = new Set(data.flatMap(repo => repo.contributors));

    return {
      totalRepositories: data.length,
      totalAuthors: uniqueOwners.size,
      totalContributors: uniqueContributors.size
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">GitHub</h1>
        <p className="text-sm text-muted-foreground">
          View ecosystem wide GitHub activities.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalRepositories}</h1>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <p className="text-sm">Repositories</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalAuthors}</h1>
          <div className="flex items-center gap-2">
            <UserPen className="w-4 h-4" />
            <p className="text-sm">Authors</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalContributors}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Contributors</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
    
  )
}
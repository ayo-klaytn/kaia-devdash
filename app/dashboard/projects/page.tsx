"use client";
import { useMemo } from 'react';
import kaiaProjects from "@/lib/mocks/kaia-projects.json"
import { LayoutGrid, TreePine, Activity } from "lucide-react";
import { columns } from "@/app/dashboard/projects/columns";
import { DataTable } from "@/app/dashboard/projects/data-table";
import { ProjectData } from "@/app/dashboard/projects/columns";

export default function ProjectsPage() {
  const data = useMemo(() => 
    kaiaProjects as ProjectData[],
    []
  );

  const stats = useMemo(() => ({
    totalProjects: data.length,
    maturedProjects: data.filter(project => project.maturity_rank >= 3).length,
    activeProjects: data.filter(project => project.community_rank >= 3).length
  }), [data]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          View projects and their metrics.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalProjects}</h1>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            <p className="text-sm">Projects</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.maturedProjects}</h1>
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4" />
            <p className="text-sm">Matured projects</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.activeProjects}</h1>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <p className="text-sm">Active in community</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProjectData } from "../columns";
import kaiaProjects from "@/lib/mocks/kaia-projects.json";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;
  const projectData = kaiaProjects.find(
    (p: ProjectData) => p.name.toLowerCase() === project.toLowerCase()
  );

  if (!projectData) {
    return <div>Project not found</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center gap-4">
        <h1 className="text-2xl font-bold">{projectData.name}</h1>
        <Button variant="outline" asChild>
          <Link
            target="_blank"
            href={`https://github.com/${projectData.github}`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>GitHub</span>
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link target="_blank" href={`https://x.com/${project}`}>
            <ExternalLink className="w-4 h-4" />
            <span>X</span>
          </Link>
        </Button>
      </div>
      <div className="flex flex-row flex-wrap gap-4">
        {projectData.dune_dashboard_urls.map((duneDashboard) => (
          <div
            key={duneDashboard.id}
            className={`flex flex-col gap-2 w-[${duneDashboard.width}]`}
          >
            <h2 className="text-lg font-medium">{duneDashboard.description}</h2>
            <div className={`w-[${duneDashboard.width}] h-[${duneDashboard.height}]`}>
              <iframe 
                src={duneDashboard.url} 
                width={duneDashboard.width} 
                height={duneDashboard.height}
                className="border-0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

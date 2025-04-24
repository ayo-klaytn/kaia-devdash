import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProjectData } from "../columns";
import kaiaProjects from "@/lib/mocks/kaia-projects.json";
import NotFoundComponent from "@/components/notfound";


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
    return <NotFoundComponent />
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold">{projectData.name}</h1>
        <div className="flex flex-row items-center gap-4">
          <Button variant="outline" asChild>
            <Link
              target="_blank"
              href={projectData.url}
            >
              <span>Web</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              target="_blank"
              href={`https://github.com/${projectData.github}`}
            >
              <span>GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link target="_blank" href={`https://x.com/${project}`}>
              <span>X</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-4">
        {projectData.dune_dashboard_urls.map((duneDashboard) => (
          <div
            key={duneDashboard.id}
            className={`flex flex-col gap-2 ${duneDashboard.width === "100%" ? "w-full" : `w-[${duneDashboard.width}]`}`}
          >
            <h2 className="text-lg font-medium">{duneDashboard.description}</h2>
            <div className={`${duneDashboard.width === "100%" ? "w-full" : `w-[${duneDashboard.width}]`} h-[${duneDashboard.height}]`}>
              <iframe 
                src={duneDashboard.url} 
                width={duneDashboard.width} 
                height={duneDashboard.height}
                className="border-1 border-orange-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

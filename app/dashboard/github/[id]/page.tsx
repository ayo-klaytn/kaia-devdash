import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, GitBranch, Star, Eye, GitFork } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RepositoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(
    `/api/view/repository?id=${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!,
      },
    }
  );

  if (!response.ok) {
    notFound();
  }

  const repository = await response.json();

  if (!repository) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Repository Details</h1>
        <p className="text-sm text-muted-foreground">
          View detailed information about the repository.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{repository.name}</CardTitle>
              <CardDescription>{repository.owner}</CardDescription>
            </div>
            <Button asChild>
              <a href={repository.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on GitHub
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant={repository.status === "active" ? "default" : "secondary"}>
              {repository.status}
            </Badge>
            {repository.remark && (
              <Badge variant="outline">{repository.remark}</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Branches</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Stars</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Watchers</span>
            </div>
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Forks</span>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Created: {new Date(repository.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Last Updated: {new Date(repository.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

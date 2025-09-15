import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Calendar, Award, Users } from "lucide-react";

export const dynamic = "force-dynamic";

type DeveloperRecord = {
  id: string
  name: string | null
  github: string | null
  address: string | null
  communityRank: number | null
  xHandle: string | null
  nftBadges?: string[] | null
  bootcampGraduated?: string | Date | null
  bootcampContributor?: string | Date | null
  createdAt: string | Date
  updatedAt: string | Date
}

function toGithubUrl(handleOrUrl: string | null): string | null {
  if (!handleOrUrl) return null
  if (handleOrUrl.startsWith('http')) return handleOrUrl
  return `https://github.com/${handleOrUrl}`
}

export default async function DeveloperPage({ params }: { params: Promise<{ developer: string }> }) {
  const { developer: developerSlug } = await params;
  const developerResponse = await fetch(`/api/view/developer?name=${developerSlug}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  if (!developerResponse.ok) {
    notFound();
  }

  const developerData: DeveloperRecord = await developerResponse.json();

  if (!developerData) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Developer Profile</h1>
        <p className="text-sm text-muted-foreground">
          View detailed information about {developerData.name}.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{developerData.name}</CardTitle>
              <CardDescription>Developer Profile</CardDescription>
            </div>
            {developerData.github && (
              <Button asChild variant="outline">
                <a href={toGithubUrl(developerData.github) || '#'} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub Profile
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Community Rank: {developerData.communityRank ?? 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">X Handle: {developerData.xHandle || 'N/A'}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {developerData.bootcampGraduated && (
              <Badge variant="default">
                <Calendar className="w-3 h-3 mr-1" />
                Bootcamp Graduate
              </Badge>
            )}
            {developerData.bootcampContributor && (
              <Badge variant="secondary">
                <Calendar className="w-3 h-3 mr-1" />
                Bootcamp Contributor
              </Badge>
            )}
            {developerData.nftBadges && developerData.nftBadges.length > 0 && (
              developerData.nftBadges.map((badge: string, index: number) => (
                <Badge key={index} variant="outline">
                  {badge}
                </Badge>
              ))
            )}
          </div>
          
          {developerData.address && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Address: {developerData.address}
              </p>
            </div>
          )}
          
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Created: {new Date(developerData.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Last Updated: {new Date(developerData.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Calendar, Award, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DeveloperPage({ params }: { params: { developer: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006';
  
  const developerResponse = await fetch(`${baseUrl}/api/view/developer?name=${params.developer}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  if (!developerResponse.ok) {
    notFound();
  }

  const developer = await developerResponse.json();

  if (!developer) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Developer Profile</h1>
        <p className="text-sm text-muted-foreground">
          View detailed information about {developer.name}.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{developer.name}</CardTitle>
              <CardDescription>Developer Profile</CardDescription>
            </div>
            {developer.github && (
              <Button asChild variant="outline">
                <a href={`https://github.com/${developer.github}`} target="_blank" rel="noopener noreferrer">
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
              <span className="text-sm">Community Rank: {developer.communityRank || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">X Handle: {developer.xHandle || 'N/A'}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {developer.bootcampGraduated && (
              <Badge variant="default">
                <Calendar className="w-3 h-3 mr-1" />
                Bootcamp Graduate
              </Badge>
            )}
            {developer.bootcampContributor && (
              <Badge variant="secondary">
                <Calendar className="w-3 h-3 mr-1" />
                Bootcamp Contributor
              </Badge>
            )}
            {developer.nftBadges && developer.nftBadges.length > 0 && (
              developer.nftBadges.map((badge: string, index: number) => (
                <Badge key={index} variant="outline">
                  {badge}
                </Badge>
              ))
            )}
          </div>
          
          {developer.address && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Address: {developer.address}
              </p>
            </div>
          )}
          
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Created: {new Date(developer.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Last Updated: {new Date(developer.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { ExternalLink, Package, UserPen, Users, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
// import { DevForumChart } from "@/app/dashboard/devforum/chart";

export const dynamic = "force-dynamic";

export default async function DevForumPage() {
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : '';
  const latestPosts = await fetch(`${baseUrl}/api/view/devforum`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  const latestPostsData = await latestPosts.json();

  const totalPosts = latestPostsData.totalPosts;
  const totalMembers = latestPostsData.totalMembers;
  const totalAdminAndMods = latestPostsData.totalAdminAndMods;
  const latestTopics = latestPostsData.topic_list.topics;


  const kpiCards = [
    {
      value: totalPosts,
      label: "Total Posts",
      icon: MessageSquare,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
      gradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
    },
    {
      value: totalMembers,
      label: "Total Members",
      icon: Users,
      iconColor: "text-green-600",
      iconBg: "bg-green-50 dark:bg-green-950/20",
      gradient: "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
    },
    {
      value: totalAdminAndMods,
      label: "Admins + Mods",
      icon: UserPen,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/20",
      gradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dev Forum</h1>
        <p className="text-muted-foreground">
          View dev forum data and latest discussions
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index}
              className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-0 shadow-sm"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">{card.label}</p>
                    <h2 className="text-3xl font-bold tracking-tight">{card.value.toLocaleString()}</h2>
                  </div>
                  <div className={`${card.iconBg} p-3 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Latest Posts</h2>
          </div>
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {latestTopics.map((post: any) => (
              <a 
                key={post.id} 
                href={`https://devforum.kaia.io/t/${post.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <span className="shrink-0 w-2 h-2 rounded-full bg-primary" />
                <h3 className="text-sm font-medium flex-1 group-hover:text-primary transition-colors">
                  {post.fancy_title}
                </h3>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

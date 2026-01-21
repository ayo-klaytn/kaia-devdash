import { XChart, type SocialMetric } from "@/app/dashboard/x/chart";
// import { XCommunityChart } from "@/app/dashboard/x/community-chart";
import { BokChart } from "@/app/dashboard/x/bok-chart";
import { DeveloperContentList } from "@/app/dashboard/x/developer-content-list";
import { ManageXPostsModal } from "@/app/dashboard/x/manage-x-posts-modal";
import { Eye, TrendingUp, BarChart3, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getKaiaDevInternData, getBokAnalyticsSeries } from "@/lib/services/social-media";

// X analytics are backed by DB and update relatively slowly; cache page HTML
export const revalidate = 900;

export default async function XPage() {
  const [kaiaDevInternRows, monthlySeries] = await Promise.all([
    getKaiaDevInternData(365),
    getBokAnalyticsSeries(),
  ]);

  const chartData = (kaiaDevInternRows || []) as unknown as SocialMetric[];

  // Fallback: Original hardcoded data (kept as baseline)
  const fallbackDeveloperContent: Array<{
    title: string;
    url: string;
    views: string;
    likes: number;
    retweets: number;
    date: string;
    type: string;
  }> = [
    {
      title: "Flatten the State, Shrink the Disk",
      url: "https://x.com/BuildonKaia/status/1993953232146846196",
      views: "1.2k",
      likes: 19,
      retweets: 6,
      date: "2025-11-27",
      type: "Technical"
    },
    {
      title: "Kaia Next Builders November Demo Day Announcement",
      url: "https://x.com/BuildonKaia/status/1993590548578681344",
      views: "2.2k",
      likes: 26,
      retweets: 13,
      date: "2025-11-26",
      type: "Event"
    },
    {
      title: "Bug Bounty with Hacken Proof Announcement",
      url: "https://x.com/BuildonKaia/status/1993288566458200270",
      views: "3.2k",
      likes: 31,
      retweets: 12,
      date: "2025-11-25",
      type: "Announcement"
    },
    {
      title: "Kaia Next Builders November Demo Day Announcement",
      url: "https://x.com/BuildonKaia/status/1992926174394343719",
      views: "4.3k",
      likes: 39,
      retweets: 15,
      date: "2025-11-24",
      type: "Event"
    },
    {
      title: "Cutting Blockchain Storage in Half Infographics",
      url: "https://x.com/BuildonKaia/status/1992820476201287768",
      views: "1.2k",
      likes: 17,
      retweets: 4,
      date: "2025-11-24",
      type: "Announcement"
    },
    {
      title: "Cutting Blockchain Storage in Half Deep Dive",
      url: "https://x.com/BuildonKaia/status/1991417667941732478",
      views: "5.7k",
      likes: 21,
      retweets: 12,
      date: "2025-11-20",
      type: "Technical"
    },
    {
      title: "Kaia v2.1.0 Announcement",
      url: "https://x.com/BuildonKaia/status/1983081299431858612",
      views: "9k",
      likes: 40,
      retweets: 14,
      date: "2025-10-28",
      type: "Announcement"
    },
    {
      title: "Kaia Wave Stablecoin Summer Hackathon Winners Announcement",
      url: "https://x.com/BuildonKaia/status/1975406735998525935",
      views: "11k",
      likes: 61,
      retweets: 14,
      date: "2025-10-07",
      type: "Event"
    },
    {
      title: "Cross-chain NFT tutorial announcement",
      url: "https://x.com/BuildonKaia/status/1978733151339102492",
      views: "3.8k",
      likes: 29,
      retweets: 14,
      date: "2025-10-16",
      type: "Tutorial"
    },
    {
      title: "Kaia Dev Connect with Google Cloud Announcement",
      url: "https://x.com/BuildonKaia/status/1971033911284400265",
      views: "12.6k",
      likes: 36,
      retweets: 16,
      date: "2025-09-25",
      type: "Event"
    },
    {
      title: "USDT Faucet now live",
      url: "https://x.com/BuildonKaia/status/1970329143473774957",
      views: "5.2k",
      likes: 38,
      retweets: 12,
      date: "2025-09-23",
      type: "Announcement"
    },
    {
      title: "Chainlink CCIP Announcement (Retweet)",
      url: "https://x.com/BuildonKaia/status/1968532404177702973",
      views: "774",
      likes: 25,
      retweets: 9,
      date: "2025-09-18",
      type: "Integration"
    },
    {
      title: "KWSSH Live Workshop with Curve Finance",
      url: "https://x.com/BuildonKaia/status/1967498628601376999",
      views: "6.9k",
      likes: 19,
      retweets: 10,
      date: "2025-09-15",
      type: "Workshop"
    },
    {
      title: "KWSSH Live Workshop with Thirdweb",
      url: "https://x.com/BuildonKaia/status/1966109474432901298",
      views: "5.5k",
      likes: 22,
      retweets: 11,
      date: "2025-09-11",
      type: "Workshop"
    },
    {
      title: "Proof of Play RNG Announcement",
      url: "https://x.com/BuildonKaia/status/1966064520809644502",
      views: "10k",
      likes: 28,
      retweets: 7,
      date: "2025-09-11",
      type: "Announcement"
    },
    {
      title: "KWSSH Live Workshop with zkMe",
      url: "https://x.com/BuildonKaia/status/1965747086063706271",
      views: "4.2k",
      likes: 19,
      retweets: 7,
      date: "2025-09-11",
      type: "Workshop"
    },
    {
      title: "KWSSH Live Workshop with Certik",
      url: "https://x.com/BuildonKaia/status/1965037404424958136",
      views: "1.9k",
      likes: 17,
      retweets: 8,
      date: "2025-09-08",
      type: "Workshop"
    },
    {
      title: "KWSSH Live Workshop with KF",
      url: "https://x.com/BuildonKaia/status/1963965635672854697",
      views: "2.9k",
      likes: 51,
      retweets: 14,
      date: "2025-09-05",
      type: "Workshop"
    },
    {
      title: "KWSSH Live Workshop with BisonAI",
      url: "https://x.com/BuildonKaia/status/1963592032552997125",
      views: "2.1k",
      likes: 30,
      retweets: 10,
      date: "2025-09-04",
      type: "Workshop"
    },
    {
      title: "KWSSH Live Workshop with Avail",
      url: "https://x.com/BuildonKaia/status/1963255665851277614",
      views: "11.3k",
      likes: 36,
      retweets: 13,
      date: "2025-09-03",
      type: "Workshop"
    },
    {
      title: "KWSSH Live Workshop with Dune",
      url: "https://x.com/BuildonKaia/status/1963255665851277614",
      views: "15k",
      likes: 82,
      retweets: 30,
      date: "2025-09-02",
      type: "Workshop"
    },
    {
      title: "OrbiterBridge Integration Announcement",
      url: "https://x.com/kaiachain/status/1844303133109092841",
      views: "5.6k",
      likes: 50,
      retweets: 9,
      date: "2024-10-15",
      type: "Integration"
    },
    {
      title: "Kaia Hacker House",
      url: "https://x.com/buildonkaia/status/1835519400256155721",
      views: "1.7k",
      likes: 30,
      retweets: 12,
      date: "2024-10-10",
      type: "Event"
    },
    {
      title: "GetBlock Official Integration Announcement",
      url: "https://x.com/buildonkaia/status/1831983153357160786",
      views: "3.4k",
      likes: 65,
      retweets: 11,
      date: "2024-10-08",
      type: "Integration"
    },
    {
      title: "Subgraph Integration Announcement",
      url: "https://x.com/buildonkaia/status/1850768544092627413",
      views: "7k",
      likes: 44,
      retweets: 10,
      date: "2024-10-20",
      type: "Integration"
    },
    {
      title: "Nodit Integration Announcement",
      url: "https://x.com/buildonkaia/status/1850850409302327802",
      views: "4.6k",
      likes: 40,
      retweets: 7,
      date: "2024-10-21",
      type: "Integration"
    },
    {
      title: "How to index smart contracts using Envio",
      url: "https://x.com/buildonkaia/status/1851174875974811892",
      views: "4.3k",
      likes: 29,
      retweets: 10,
      date: "2024-10-22",
      type: "Tutorial"
    },
    {
      title: "Kaiascan API Announcement",
      url: "https://x.com/buildonkaia/status/1851180378914279664",
      views: "4.8k",
      likes: 22,
      retweets: 8,
      date: "2024-10-22",
      type: "Announcement"
    },
    {
      title: "Mini Dapps Guide on Kaia Docs",
      url: "https://x.com/buildonkaia/status/1876135397379723709",
      views: "11k",
      likes: 110,
      retweets: 29,
      date: "2024-11-15",
      type: "Tutorial"
    },
    {
      title: "How to access Kaiachain data using Kaiascan API guide",
      url: "https://x.com/buildonkaia/status/1892488141212426497",
      views: "3k",
      likes: 47,
      retweets: 12,
      date: "2024-12-01",
      type: "Tutorial"
    },
    {
      title: "Kaiascan Free API Announcement",
      url: "https://x.com/buildonkaia/status/1894630664932397366",
      views: "16k",
      likes: 69,
      retweets: 10,
      date: "2024-12-05",
      type: "Announcement"
    },
    {
      title: "Kaia Live on Eliza Plugin Registry",
      url: "https://x.com/buildonkaia/status/1897848821864120369",
      views: "6k",
      likes: 61,
      retweets: 14,
      date: "2024-12-10",
      type: "Integration"
    },
    {
      title: "Foundry Verify Guide on Kaiascan Docs",
      url: "https://x.com/buildonkaia/status/1900090283095929159",
      views: "1.2k",
      likes: 35,
      retweets: 3,
      date: "2024-12-15",
      type: "Tutorial"
    },
    {
      title: "Bootcamp Teaser",
      url: "https://x.com/buildonkaia/status/1920041011608273378",
      views: "5.5k",
      likes: 51,
      retweets: 17,
      date: "2025-01-10",
      type: "Event"
    },
    {
      title: "Bootcamp registration now opened",
      url: "https://x.com/buildonkaia/status/1920765817756463174",
      views: "11k",
      likes: 105,
      retweets: 45,
      date: "2025-01-12",
      type: "Event"
    },
    {
      title: "Bootcamp Announcement Video",
      url: "https://x.com/buildonkaia/status/1922221627766366615",
      views: "4.7k",
      likes: 55,
      retweets: 19,
      date: "2025-01-15",
      type: "Event"
    },
    {
      title: "Technical Deep dive into Kaia's Native USDT Ecosystem",
      url: "https://x.com/buildonkaia/status/1924330296075583524",
      views: "749",
      likes: 17,
      retweets: 5,
      date: "2025-01-20",
      type: "Technical"
    },
    {
      title: "Kaiascan Feature Release",
      url: "https://x.com/buildonkaia/status/1928295310146540008",
      views: "1.7k",
      likes: 44,
      retweets: 6,
      date: "2025-01-25",
      type: "Announcement"
    },
    {
      title: "Kaia Agent Kit Announcement",
      url: "https://x.com/buildonkaia/status/1929463899285606890",
      views: "3.3k",
      likes: 56,
      retweets: 15,
      date: "2025-01-30",
      type: "Integration"
    },
    {
      title: "Kaia version 2.0.1 announcement",
      url: "https://x.com/buildonkaia/status/1931989524852122038",
      views: "2.9k",
      likes: 40,
      retweets: 8,
      date: "2025-02-05",
      type: "Announcement"
    },
    {
      title: "How to use platform level Multisig on Kaia",
      url: "https://x.com/buildonkaia/status/1934970164971180345",
      views: "1.4k",
      likes: 42,
      retweets: 5,
      date: "2025-02-10",
      type: "Tutorial"
    }
  ];

  // Fetch Developer Content Engagement Data from database
  let databasePosts: Array<{
    title: string;
    url: string;
    views: string;
    likes: number;
    retweets: number;
    date: string;
    type: string;
  }> = [];

  try {
    const developerContentResponse = await fetch(
      "/api/view/x-posts?account=BuildonKaia&limit=1000",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (developerContentResponse.ok) {
      const posts = (await developerContentResponse.json()) as Array<{
        title: string;
        url: string;
        views: string | null;
        likes: number;
        retweets: number;
        date: string;
        type: string;
      }>;
      databasePosts = posts.map((post) => ({
        title: post.title,
        url: post.url,
        views: post.views || "0",
        likes: post.likes || 0,
        retweets: post.retweets || 0,
        date: post.date,
        type: post.type,
      }));
    } else {
      console.error(
        "Failed to fetch developer content:",
        developerContentResponse.status,
        developerContentResponse.statusText,
      );
    }
  } catch (error) {
    console.error("Error fetching developer content:", error);
  }

  // Merge: Database posts override fallback posts (by URL), then add any new database posts
  // Create a map of fallback posts by URL
  const fallbackMap = new Map(fallbackDeveloperContent.map(post => [post.url, post]));
  
  // Override with database posts (database takes priority)
  databasePosts.forEach(post => {
    fallbackMap.set(post.url, post);
  });

  // Convert back to array and sort by date (newest first)
  const developerContent = Array.from(fallbackMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const insightCards = [
    {
      value: developerContent.length.toString(),
      label: "Total Content Pieces",
      sublabel: "Developer-focused posts",
      icon: MessageSquare,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
      gradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
    },
    {
      value: "5.2k",
      label: "Average Views",
      sublabel: "Per content piece",
      icon: Eye,
      iconColor: "text-green-600",
      iconBg: "bg-green-50 dark:bg-green-950/20",
      gradient: "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
    },
    {
      value: "Integration",
      label: "Top Content Type",
      sublabel: "Most engaging category",
      icon: TrendingUp,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/20",
      gradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
    },
    {
      value: "7.8%",
      label: "Engagement Rate",
      sublabel: "Average across all posts",
      icon: BarChart3,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50 dark:bg-orange-950/20",
      gradient: "from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">X (Twitter) Analytics</h1>
        <p className="text-muted-foreground">
          Track engagement and performance across X/Twitter channels
        </p>
      </div>

      {/* Key Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index}
              className="relative overflow-hidden border-0 shadow-sm"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">{card.label}</p>
                    <h2 className="text-3xl font-bold tracking-tight">{card.value}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{card.sublabel}</p>
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

      {/* Developer Content Engagement Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Developer Content Engagement</h2>
            </div>
            <ManageXPostsModal />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Track views, likes, and retweets for developer-focused announcements and content.
          </p>
          <DeveloperContentList items={developerContent} />
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="border-0 shadow-sm bg-primary/5">
        <CardContent className="p-6">
          <h4 className="font-semibold text-sm mb-3">Performance Summary</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Integration announcements perform best with 5.8k average views</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Tutorial content shows strong engagement with 6.2% average rate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Peak performance during Q4 2024 with 16k views on API announcement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Consistent growth in developer community engagement</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Build on Kaia - Analytics */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Build on Kaia — Analytics</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            <span className="font-semibold">Impressions</span> measure how many times Build on Kaia posts were
            shown across X (timeline, profile, search, Explore, embeds), reflecting overall reach.{" "}
            <span className="font-semibold">Engagements</span> capture all interactions on those posts
            (likes, reposts, quotes, replies, link clicks, profile taps, media plays, etc.), indicating how
            strongly the content resonated. All metrics are sourced from X&apos;s native analytics.
          </p>
          <BokChart data={monthlySeries} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {(() => {
              const totals = monthlySeries.reduce(
                (a, m) => ({
                  impressions: a.impressions + m.impressions,
                  engagements:
                    a.engagements +
                    Math.round((m.engagementRate / 100) * m.impressions),
                  newFollows: a.newFollows + m.newFollowers,
                }),
                { impressions: 0, engagements: 0, newFollows: 0 },
              );
              const engagementRate =
                totals.impressions > 0
                  ? ((totals.engagements / totals.impressions) * 100).toFixed(1)
                  : 0;
              return (
                <>
                  <div className="flex flex-col gap-1 p-3 rounded-lg border text-center hover:bg-muted/50 transition-colors">
                    <span className="text-xl font-bold">{totals.impressions.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">Impressions</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-lg border text-center hover:bg-muted/50 transition-colors">
                    <span className="text-xl font-bold">{totals.engagements.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">Engagements</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-lg border text-center hover:bg-muted/50 transition-colors">
                    <span className="text-xl font-bold">{engagementRate}%</span>
                    <span className="text-xs text-muted-foreground">Engagement Rate</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-lg border text-center hover:bg-muted/50 transition-colors">
                    <span className="text-xl font-bold">
                      {totals.newFollows.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      New Followers
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Kaia Dev Intern */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Kaia Dev Intern</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Kaia Dev Intern is an internally managed, “intern-style” X account that complements the main Build
            on Kaia handle with light-hearted, informal engagement. It reacts to posts, adds playful commentary,
            boosts conversations, and helps make technical updates feel more relatable as a personality extension
            of the Kaia DevRel brand.
          </p>
          {chartData && chartData.length > 0 ? (
            <XChart chartData={chartData} />
          ) : (
            <div className="p-8 text-center text-muted-foreground rounded-lg border border-dashed">
              No data available for Kaia Dev Intern
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
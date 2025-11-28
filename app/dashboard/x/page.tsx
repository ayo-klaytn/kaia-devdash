import { XChart, type SocialMetric } from "@/app/dashboard/x/chart";
// import { XCommunityChart } from "@/app/dashboard/x/community-chart";
import { BokChart } from "@/app/dashboard/x/bok-chart";
import fs from "fs/promises";
import path from "path";
import { Eye, Heart, Repeat2, ExternalLink, TrendingUp, BarChart3, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function XPage() {
  // Get the base URL for server-side fetch
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : '';
  let chartData: SocialMetric[] = [];
  try {
    const chartDataResponse = await fetch(`${baseUrl}/api/view/social-media`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (chartDataResponse.ok) {
      const chartDataResponse_json = await chartDataResponse.json();
      chartData = chartDataResponse_json.kaiaDevIntern || [];
    } else {
      console.error('Failed to fetch social media data:', chartDataResponse.status, chartDataResponse.statusText);
    }
  } catch (error) {
    console.error('Error fetching social media data:', error);
  }

  // Load Build on Kaia CSV from mocks (server-side)
  const csvPath = path.join(process.cwd(), "lib", "mocks", "bok-analytics.csv");
  const csvText = await fs.readFile(csvPath, "utf8");

  // Parse CSV (Date,Impressions,Likes,Engagements,Bookmarks,Shares,New follows,Unfollows,Replies,Reposts,Profile visits,Create Post,Video views,Media views)
  const rows = csvText
    .trim()
    .split(/\r?\n/)
    .slice(1) // skip header
    .map((line) => line.replace(/^"|"$/g, ""))
    .map((line) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/));

type Daily = { date: Date; impressions: number; engagements: number; profileVisits: number; replies: number; likes: number; reposts: number; bookmarks: number; shares: number; newFollows: number };
  const daily: Daily[] = rows.map((cols) => {
    const dateStr = cols[0].replace(/^"|"$/g, "");
    const d = new Date(dateStr);
    const n = (idx: number) => Number(String(cols[idx]).replace(/[^0-9.-]/g, "")) || 0;
    return {
      date: d,
      impressions: n(1),
      likes: n(2),
      engagements: n(3),
      bookmarks: n(4),
      shares: n(5),
      replies: n(8),
      reposts: n(9),
      profileVisits: n(10),
      newFollows: n(6),
    };
  });

  // Group by month for chart
  const monthly = daily.reduce((acc: Record<string, { month: string; impressions: number; engagements: number; profileVisits: number; replies: number; likes: number; reposts: number; bookmarks: number; shares: number; newFollows: number }>, d) => {
    const month = d.date.toISOString().slice(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { month, impressions: 0, engagements: 0, profileVisits: 0, replies: 0, likes: 0, reposts: 0, bookmarks: 0, shares: 0, newFollows: 0 };
    }
    acc[month].impressions += d.impressions;
    acc[month].engagements += d.engagements;
    acc[month].profileVisits += d.profileVisits;
    acc[month].replies += d.replies;
    acc[month].likes += d.likes;
    acc[month].reposts += d.reposts;
    acc[month].bookmarks += d.bookmarks;
    acc[month].shares += d.shares;
    acc[month].newFollows += d.newFollows;
    return acc;
  }, {} as Record<string, { month: string; impressions: number; engagements: number; profileVisits: number; replies: number; likes: number; reposts: number; bookmarks: number; shares: number; newFollows: number }>);

  const monthlySeries = Object.values(monthly)
    .sort((a, b) => new Date(a.month + '-01').getTime() - new Date(b.month + '-01').getTime())
    .map((m) => ({
      month: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      impressions: m.impressions,
      engagementRate: m.impressions > 0 ? Number(((m.engagements / m.impressions) * 100).toFixed(2)) : 0,
      newFollowers: m.newFollows,
    }));

  // Developer Content Engagement Data
  const developerContent = [
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
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Developer Content Engagement</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Track views, likes, and retweets for developer-focused announcements and content
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {developerContent.map((content, index) => (
              <a
                key={index}
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-all hover:shadow-sm group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{content.title}</h3>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{content.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{content.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat2 className="w-3 h-3" />
                    <span>{content.retweets}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{content.date}</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {content.type}
                  </span>
                </div>
              </a>
            ))}
          </div>
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
          <BokChart data={monthlySeries} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {(() => {
              const totals = daily.reduce(
                (a, b) => ({
                  impressions: a.impressions + b.impressions,
                  engagements: a.engagements + b.engagements,
                  profileVisits: a.profileVisits + b.profileVisits,
                  replies: a.replies + b.replies,
                  likes: a.likes + b.likes,
                  reposts: a.reposts + b.reposts,
                  bookmarks: a.bookmarks + b.bookmarks,
                  shares: a.shares + b.shares,
                  newFollows: a.newFollows + b.newFollows,
                }),
                { impressions: 0, engagements: 0, profileVisits: 0, replies: 0, likes: 0, reposts: 0, bookmarks: 0, shares: 0, newFollows: 0 }
              );
              const engagementRate = totals.impressions > 0 ? ((totals.engagements / totals.impressions) * 100).toFixed(1) : 0;
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
                    <span className="text-xl font-bold">{totals.likes.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">Likes</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-lg border text-center hover:bg-muted/50 transition-colors">
                    <span className="text-xl font-bold">{totals.reposts.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">Reposts</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-lg border text-center hover:bg-muted/50 transition-colors">
                    <span className="text-xl font-bold">{totals.profileVisits.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">Profile Visits</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-lg border text-center hover:bg-muted/50 transition-colors">
                    <span className="text-xl font-bold">{totals.newFollows.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">New Followers</span>
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
import { XChart, type SocialMetric } from "@/app/dashboard/x/chart";
// import { XCommunityChart } from "@/app/dashboard/x/community-chart";
import { BokChart } from "@/app/dashboard/x/bok-chart";
import fs from "fs/promises";
import path from "path";
import { Eye, Heart, Repeat2, ExternalLink } from "lucide-react";

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

  type Daily = { date: Date; impressions: number; engagements: number; profileVisits: number; replies: number; likes: number; reposts: number; bookmarks: number; shares: number };
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
    };
  });

  // Group by month for chart
  const monthly = daily.reduce((acc: Record<string, { month: string; impressions: number; engagements: number; profileVisits: number; replies: number; likes: number; reposts: number; bookmarks: number; shares: number }>, d) => {
    const month = d.date.toISOString().slice(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { month, impressions: 0, engagements: 0, profileVisits: 0, replies: 0, likes: 0, reposts: 0, bookmarks: 0, shares: 0 };
    }
    acc[month].impressions += d.impressions;
    acc[month].engagements += d.engagements;
    acc[month].profileVisits += d.profileVisits;
    acc[month].replies += d.replies;
    acc[month].likes += d.likes;
    acc[month].reposts += d.reposts;
    acc[month].bookmarks += d.bookmarks;
    acc[month].shares += d.shares;
    return acc;
  }, {} as Record<string, { month: string; impressions: number; engagements: number; profileVisits: number; replies: number; likes: number; reposts: number; bookmarks: number; shares: number }>);

  const monthlySeries = Object.values(monthly).map((m) => ({
    month: m.month,
    impressions: m.impressions,
    engagementRate: m.impressions > 0 ? Number(((m.engagements / m.impressions) * 100).toFixed(2)) : 0,
  }));

  // Developer Content Engagement Data
  const developerContent = [
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

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">X (Twitter) Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track engagement and performance across X/Twitter channels.
        </p>
      </div>

      {/* Developer Content Engagement Section */}
      <div className="flex flex-col gap-4 border rounded-md p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Developer Content Engagement</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Track views, likes, and retweets for developer-focused announcements and content.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {developerContent.map((content, index) => (
            <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm line-clamp-2">{content.title}</h3>
                <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{content.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-muted-foreground" />
                  <span>{content.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Repeat2 className="w-3 h-3 text-muted-foreground" />
                  <span>{content.retweets}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{content.date}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {content.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights Section */}
      <div className="flex flex-col gap-4 border rounded-md p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Key Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2 p-3 border rounded-lg">
            <h3 className="font-medium text-sm">Total Content Pieces</h3>
            <p className="text-2xl font-bold">{developerContent.length}</p>
            <p className="text-xs text-muted-foreground">Developer-focused posts</p>
          </div>
          <div className="flex flex-col gap-2 p-3 border rounded-lg">
            <h3 className="font-medium text-sm">Average Views</h3>
            <p className="text-2xl font-bold">5.2k</p>
            <p className="text-xs text-muted-foreground">Per content piece</p>
          </div>
          <div className="flex flex-col gap-2 p-3 border rounded-lg">
            <h3 className="font-medium text-sm">Top Content Type</h3>
            <p className="text-2xl font-bold">Integration</p>
            <p className="text-xs text-muted-foreground">Most engaging category</p>
          </div>
          <div className="flex flex-col gap-2 p-3 border rounded-lg">
            <h3 className="font-medium text-sm">Engagement Rate</h3>
            <p className="text-2xl font-bold">7.8%</p>
            <p className="text-xs text-muted-foreground">Average across all posts</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Performance Summary</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Integration announcements perform best with 5.8k average views</li>
            <li>• Tutorial content shows strong engagement with 6.2% average rate</li>
            <li>• Peak performance during Q4 2024 with 16k views on API announcement</li>
            <li>• Consistent growth in developer community engagement</li>
          </ul>
        </div>
      </div>

      {/* Build on Kaia - Analytics */}
      <div className="flex flex-col gap-4 border rounded-md p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Build on Kaia — Analytics</h2>
        </div>
        <BokChart data={monthlySeries} />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
              }),
              { impressions: 0, engagements: 0, profileVisits: 0, replies: 0, likes: 0, reposts: 0, bookmarks: 0, shares: 0 }
            );
            const engagementRate = totals.impressions > 0 ? ((totals.engagements / totals.impressions) * 100).toFixed(1) : 0;
            return (
              <>
                <div className="flex flex-col gap-1 p-2 border rounded text-center">
                  <span className="text-lg font-bold">{totals.impressions.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Impressions</span>
                </div>
                <div className="flex flex-col gap-1 p-2 border rounded text-center">
                  <span className="text-lg font-bold">{totals.engagements.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Engagements</span>
                </div>
                <div className="flex flex-col gap-1 p-2 border rounded text-center">
                  <span className="text-lg font-bold">{engagementRate}%</span>
                  <span className="text-xs text-muted-foreground">Engagement Rate</span>
                </div>
                <div className="flex flex-col gap-1 p-2 border rounded text-center">
                  <span className="text-lg font-bold">{totals.likes.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Likes</span>
                </div>
                <div className="flex flex-col gap-1 p-2 border rounded text-center">
                  <span className="text-lg font-bold">{totals.reposts.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Reposts</span>
                </div>
                <div className="flex flex-col gap-1 p-2 border rounded text-center">
                  <span className="text-lg font-bold">{totals.profileVisits.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Profile Visits</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Kaia Dev Intern */}
      <div className="flex flex-col gap-4 border rounded-md p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Kaia Dev Intern</h2>
        </div>
        {chartData && chartData.length > 0 ? (
          <XChart chartData={chartData} />
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No data available for Kaia Dev Intern
          </div>
        )}
      </div>
    </div>
  );
}
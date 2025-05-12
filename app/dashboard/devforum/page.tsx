import devForum from "@/lib/mocks/kaia-devforum.json";
import { ExternalLink, Package, UserPen, Users } from "lucide-react";
import { DevForumChart } from "@/app/dashboard/devforum/chart";

export default async function DevForumPage() {

  const latestPosts = await fetch("http://localhost:3006/api/view/devforum", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!
    }
  });

  const latestPostsData = await latestPosts.json();


  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dev Forum</h1>
        <p className="text-sm text-muted-foreground">
          View dev forum data.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{devForum.overview.totalPosts}</h1>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <p className="text-sm">Total posts</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{devForum.overview.totalMembers}</h1>
          <div className="flex items-center gap-2">
            <UserPen className="w-4 h-4" />
            <p className="text-sm">Total members</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{devForum.overview.totalAdminsMods}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Total admins + mods</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <DevForumChart />
      </div>
      <h1 className="text-2xl font-bold">Latest Posts</h1>
      <div className="flex flex-col gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {latestPostsData.map((post: any) => (
          <div key={post.id} className="flex flex-col gap-2 w-fit">
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline underline-offset-4">
              <h2 className="text-lg">{post.topic_html_title}</h2>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

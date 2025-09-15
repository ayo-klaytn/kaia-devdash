import { ExternalLink, Package, UserPen, Users } from "lucide-react";
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
          <h1 className="text-2xl font-bold">{totalPosts}</h1>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <p className="text-sm">Total posts</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{totalMembers}</h1>
          <div className="flex items-center gap-2">
            <UserPen className="w-4 h-4" />
            <p className="text-sm">Total members</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{totalAdminAndMods}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Total admins + mods</p>
          </div>
        </div>
      </div>
      {/* <div className="flex flex-col gap-4">
        <DevForumChart />
      </div> */}
      <h1 className="text-2xl font-bold">Latest Posts</h1>
      <div className="flex flex-col gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {latestTopics.map((post: any) => (
          <div key={post.id} className="flex flex-col gap-2 w-fit">
            <a href={`https://devforum.kaia.io/t/${post.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline underline-offset-4 text-blue-500">
              <h2 className="text-lg">{post.fancy_title}</h2>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

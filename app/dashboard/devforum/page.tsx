import devForum from "@/lib/mocks/kaia-devforum.json";
import { ExternalLink, Package, UserPen, Users } from "lucide-react";
import { DevForumChart } from "@/app/dashboard/devforum/chart";

type DevForumPost = {
  id: number;
  title: string;
  url: string;
}

const stats = {
  totalPosts: 3492,
  totalMembers: 1970,
  totalAdminsMods: 13,
}

export default function DevForumPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalPosts}</h1>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <p className="text-sm">Total posts</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalMembers}</h1>
          <div className="flex items-center gap-2">
            <UserPen className="w-4 h-4" />
            <p className="text-sm">Total members</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalAdminsMods}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Total admins + mods</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Kaia Dev Intern</h2>
        <DevForumChart />
      </div>
      <h1 className="text-2xl font-bold">Latest Posts</h1>
      <div className="flex flex-col gap-4">
        {devForum.devforum.map((post: DevForumPost) => (
          <div key={post.id} className="flex flex-col gap-2 w-fit">
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline underline-offset-4">
              <h2 className="text-lg">{post.title}</h2>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

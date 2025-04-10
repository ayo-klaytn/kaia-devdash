import devForum from "@/lib/mocks/kaia-devforum.json";
import { ExternalLink } from "lucide-react";

type DevForumPost = {
  id: number;
  title: string;
  url: string;
}

export default function DevForumPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Latest Posts</h1>
      <div className="flex flex-col gap-4">
        {devForum.devforum.map((post: DevForumPost) => (
          <div key={post.id} className="flex flex-col gap-2">
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

"use client";

import { useMemo, useState } from "react";
import { Eye, Heart, Repeat2, ExternalLink } from "lucide-react";

type DeveloperContentItem = {
  title: string;
  url: string;
  views: string;
  likes: number;
  retweets: number;
  date: string;
  type: string;
};

type SortMode = "engagement" | "recent" | "likes" | "retweets";

interface DeveloperContentListProps {
  items: DeveloperContentItem[];
}

export function DeveloperContentList({ items }: DeveloperContentListProps) {
  const [sortMode, setSortMode] = useState<SortMode>("engagement"); // default: likes + retweets

  const sortedItems = useMemo(() => {
    const copy = [...items];
    switch (sortMode) {
      case "recent":
        return copy.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case "likes":
        return copy.sort((a, b) => b.likes - a.likes);
      case "retweets":
        return copy.sort((a, b) => b.retweets - a.retweets);
      case "engagement":
      default:
        return copy.sort(
          (a, b) =>
            b.likes + b.retweets - (a.likes + a.retweets)
        );
    }
  }, [items, sortMode]);

  return (
    <>
      <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Sorted by{" "}
          {sortMode === "engagement"
            ? "engagement (likes + reposts)"
            : sortMode === "recent"
            ? "most recent"
            : sortMode === "likes"
            ? "top likes"
            : "top reposts"}
          .
        </p>
        <div className="inline-flex rounded-lg border bg-muted/40 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setSortMode("recent")}
            className={`px-2.5 py-1 rounded-md transition ${
              sortMode === "recent"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Most Recent
          </button>
          <button
            type="button"
            onClick={() => setSortMode("likes")}
            className={`px-2.5 py-1 rounded-md transition ${
              sortMode === "likes"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Top Likes
          </button>
          <button
            type="button"
            onClick={() => setSortMode("retweets")}
            className={`px-2.5 py-1 rounded-md transition ${
              sortMode === "retweets"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Top Reposts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {sortedItems.map((content, index) => (
          <a
            key={index}
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-all hover:shadow-sm group"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {content.title}
              </h3>
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
    </>
  );
}



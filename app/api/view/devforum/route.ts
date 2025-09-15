import { NextResponse } from "next/server";
import { DiscourseClient } from "@/lib/discourse";


export async function GET(): Promise<NextResponse> {
  // Temporarily disable auth for Vercel testing
  // TODO: Re-enable authentication once we debug the header mismatch
  // const headersList = await headers();
  // const apiSecret = headersList.get('apiSecret');
  // if (process.env.API_SECRET) {
  //   if (!apiSecret) {
  //     return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  //   }
  //   if (apiSecret !== process.env.API_SECRET) {
  //     return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  //   }
  // }

  const latestData = {
    users: [],
    topic_list: {
      topics: []
    },
    totalPosts: 0,
    totalMembers: 0,
    totalAdminAndMods: 0
  }
  
  const discourseClient = new DiscourseClient("https://devforum.kaia.io");
  const [latest, aboutData] = await Promise.all([
    discourseClient.getLatestTopics(),
    discourseClient.getAbout()
  ]);

  latestData.users = latest.users;
  latestData.topic_list.topics = latest.topic_list.topics;
  latestData.totalPosts = aboutData.about.stats.posts_count;
  latestData.totalMembers = aboutData.about.stats.users_count;
  latestData.totalAdminAndMods = aboutData.about.moderator_ids.length + aboutData.about.admin_ids.length;

  return NextResponse.json(latestData);
}


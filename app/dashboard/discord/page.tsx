import { Package, UserPen, Users } from "lucide-react";
import kaia_discord from "@/lib/mocks/kaia-discord.json";
import { DiscordChart } from "./chart";

export default function DiscordPage() {
  const { overview } = kaia_discord;

  
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{overview.totalDevelopers}</h1>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <p className="text-sm">Developers</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{overview.totalMessages}</h1>
          <div className="flex items-center gap-2">
            <UserPen className="w-4 h-4" />
            <p className="text-sm">Messages</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{overview.totalDevChannels}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Channels</p>
          </div>
        </div>
      </div>
      <DiscordChart />
    </div>
  )
}
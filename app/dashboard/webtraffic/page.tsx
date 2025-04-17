import { UserPen, Package, Users } from "lucide-react";
import webTrafficData from "@/lib/mocks/kaia-docs-webtraffic.json";
import { WebTrafficChart } from "@/app/dashboard/webtraffic/chart";
export default function WebTrafficPage() {

  const { overview, daily_stats, pages, referrers, browsers, operating_systems, devices } = webTrafficData;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{overview.views.value}</h1>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <p className="text-sm">Views</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{overview.visits.value}</h1>
          <div className="flex items-center gap-2">
            <UserPen className="w-4 h-4" />
            <p className="text-sm">Visits</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{overview.visitors.value}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Visitors</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{overview.bounce_rate.value}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Bounce Rate</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{overview.visit_duration.value}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Visit Duration</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <WebTrafficChart />
      </div>
    </div>
  )
}
import { UserPen, Package, Users } from "lucide-react";
import webTrafficData from "@/lib/mocks/kaia-docs-webtraffic.json";
import { WebTrafficChart } from "@/app/dashboard/webtraffic/chart";
export default function WebTrafficPage() {
  const {
    overview,
    pages,
    referrers,
    browsers,
    operating_systems,
    devices,
  } = webTrafficData;

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
          <h1 className="text-2xl font-bold">
            {overview.visit_duration.value}
          </h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Visit Duration</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <WebTrafficChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h2 className="text-lg font-bold">Pages</h2>
          {pages.map((page) => (
            <div
              key={page.path}
              className="flex flex-row gap-4 justify-between"
            >
              <h3 className="text-sm">{page.path}</h3>
              <p className="text-sm">{page.views}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h2 className="text-lg font-bold">Referrers</h2>
          {referrers.map((referrer) => (
            <div
              key={referrer.source}
              className="flex flex-row gap-4 justify-between"
            >
              <h3 className="text-sm">{referrer.source}</h3>
              <p className="text-sm">{referrer.visitors}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h2 className="text-lg font-bold">Browsers</h2>
          {browsers.map((browser) => (
            <div
              key={browser.name}
              className="flex flex-row gap-4 justify-between"
            >
              <h3 className="text-sm">{browser.name}</h3>
              <p className="text-sm">{browser.visitors}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h2 className="text-lg font-bold">Operating Systems</h2>
          {operating_systems.map((operating_system) => (
            <div
              key={operating_system.name}
              className="flex flex-row gap-4 justify-between"
            >
              <h3 className="text-sm">{operating_system.name}</h3>
              <p className="text-sm">{operating_system.visitors}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h2 className="text-lg font-bold">Devices</h2>
          {devices.map((device) => (
            <div
              key={device.type}
              className="flex flex-row gap-4 justify-between"
            >
              <h3 className="text-sm">{device.type}</h3>
              <p className="text-sm">{device.visitors}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

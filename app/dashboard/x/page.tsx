import { XChart } from "@/app/dashboard/x/chart";
import { XCommunityChart } from "@/app/dashboard/x/community-chart";

export const dynamic = "force-dynamic";

export default async function XPage() {

  const chartDataResponse = await fetch("http://localhost:3006/api/view/social-media", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  const chartData = await chartDataResponse.json();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">X / Twitter</h1>
        <p className="text-sm text-muted-foreground">
          View developer ecosystem wide X activities.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Kaia Dev Intern</h2>
        <XChart chartData={chartData.kaiaDevIntern} />
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Kaia Dev Community</h2>
        <XCommunityChart />
      </div>
    </div>
  );
}

import { XChart } from "@/app/dashboard/x/chart";
import { XCommunityChart } from "@/app/dashboard/x/community-chart";


export default function XPage() {

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
        <XChart />
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Kaia Dev Community</h2>
        <XCommunityChart />
      </div>
    </div>
  );
}

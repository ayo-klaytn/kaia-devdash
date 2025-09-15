"use client"

// Temporarily disable auth for Vercel testing
// import { authClient } from "@/lib/auth-client" // import the auth client
// import UnauthorizedComponent from "@/components/unauthorized";
// import { Skeleton } from "@/components/ui/skeleton";
import { Package, UserPen, Users } from "lucide-react";



export default function Dashboard() {
  // Temporarily disable auth for Vercel testing
  // const { 
  //   data: session, 
  //   isPending, // loading state
  //   error, // error object
  // } = authClient.useSession()


  // if (isPending) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-screen p-4">
  //       <Skeleton className="w-full h-full rounded-md" />
  //     </div>
  //   )
  // }

  // if (error) {
  //   return <p>Error: {error.message}</p>
  // }

  // if (session?.user?.emailVerified) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Summary of North Star metrics.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">63</h1>
            <div className="flex items-center gap-2">
              <UserPen className="w-4 h-4" />
              <p className="text-sm">Monthly Active Developers</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">172</h1>
            <div className="flex items-center gap-2">
              <UserPen className="w-4 h-4" />
              <p className="text-sm">New Developers</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">317</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Repositories</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">290,873</h1>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <p className="text-sm">Views</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold line-through">1,000</h1>
            <div className="flex items-center gap-2">
              <UserPen className="w-4 h-4" />
              <p className="text-sm">Visits / day</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold line-through">8000</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Total Contracts</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-1xl font-bold">Major Leads (What did we do to influence the major outcomes)</h1>
            <table className="w-full border-collapse">
              <tbody>
              <tr className="border">
                  <td className="p-2 border">Technical Content Rollout</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">KR Stablecoin Hackathon</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">Kaia Wave Stablecoin Summer Hackathon</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">Tech upgrades and rollouts</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">Global Events and Activations</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">Kaia Chinese Tour</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-1xl font-bold">Major Lags (the major outcomes)</h1>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border">
                  <td className="p-2 border">172 New Developers</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border line-through">1,000 visit per day to dev related websites</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">63 active developers</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border line-through">8,000 total contracts deployed</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border line-through">5 active products launched</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  // return <UnauthorizedComponent />
}
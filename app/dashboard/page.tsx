import { Package, UserPen, Users } from "lucide-react";

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : '';

  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 20000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  // Fetch only Umami-derived metrics for performance, with graceful fallback
  let lastMonthViews = 0; // kept for potential use elsewhere
  let visits30d = 0;
  let views30d = 0;
  try {
    const [traffic365Res, traffic30Res] = await Promise.all([
      fetchWithTimeout(`${baseUrl}/api/data/web-traffic?days=365`),
      fetchWithTimeout(`${baseUrl}/api/data/web-traffic?days=30`)
    ]);
    const traffic365 = traffic365Res.ok ? await traffic365Res.json() : {};
    const traffic30 = traffic30Res.ok ? await traffic30Res.json() : {};

    const monthlyViewsArr = Array.isArray(traffic365?.monthly_views) ? traffic365.monthly_views : [];
    lastMonthViews = monthlyViewsArr.length > 0 ? Number(monthlyViewsArr[monthlyViewsArr.length - 1]?.views || 0) : 0;
    visits30d = Number(traffic30?.overview?.visits?.value || 0);
    views30d = Number(traffic30?.overview?.views?.value || 0);
  } catch (_e) {
    // keep defaults (0) on timeout/abort
  }

  // Hardcoded quick metrics to avoid extra API latency
  const monthlyActiveDevs = 57;
  const newDevelopers365 = 401;
  const repositoriesCount = 361;
  const activeContracts = 1247;

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
            <h1 className="text-2xl font-bold">{monthlyActiveDevs.toLocaleString()}</h1>
            <div className="flex items-center gap-2">
              <UserPen className="w-4 h-4" />
              <p className="text-sm">Monthly Active Developers</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{newDevelopers365.toLocaleString()}</h1>
            <div className="flex items-center gap-2">
              <UserPen className="w-4 h-4" />
              <p className="text-sm">New Developers</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{repositoriesCount.toLocaleString()}</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Repositories</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{views30d.toLocaleString()}</h1>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <p className="text-sm">Views</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{visits30d.toLocaleString()}</h1>
            <div className="flex items-center gap-2">
              <UserPen className="w-4 h-4" />
              <p className="text-sm">Visits</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{activeContracts.toLocaleString()}</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Active Contracts</p>
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
                  <td className="p-2 border">Bootcamps</td>
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
                  <td className="p-2 border">Global Events and Activations (e.g Kaia Chinese Tour)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-1xl font-bold">Major Lags (the major outcomes)</h1>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border">
                  <td className="p-2 border">{newDevelopers365.toLocaleString()} New Developers (365d)</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">{visits30d.toLocaleString()} Visits / Month</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">{monthlyActiveDevs.toLocaleString()} active developers (28d)</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">{activeContracts.toLocaleString()} active contracts / month</td>
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
}
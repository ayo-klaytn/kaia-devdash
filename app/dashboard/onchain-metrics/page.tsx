import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default async function OnchainMetricsPage() {

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold">Onchain Metrics</h1>
        <div className="flex flex-row items-center gap-4">
          <Button variant="outline" asChild>
            <Link
              target="_blank"
              href="https://dune.com/kaia_foundation/kaia-official-dashboard"
            >
              <span>Dune</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              target="_blank"
              href="https://kaiascan.io/charts"
            >
              <span>Kaiascan</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-4">
      </div>
    </div>
  );
}

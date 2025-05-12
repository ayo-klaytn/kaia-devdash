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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">
            Number of active contracts
          </p>
          <iframe src="https://dune.com/embeds/4216780/7101037" className="w-full h-[400px] border-1 border-orange-500"/>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">
            Hot contracts 🔥
          </p>
          <iframe src="https://dune.com/embeds/4220772/7101058" className="w-full h-[600px] border-1 border-orange-500"/>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">
            TVL (source: Defillama)
          </p>
          <iframe src="https://dune.com/embeds/4222136/7103243" className="w-full h-[400px] border-1 border-orange-500"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">
              Max TPS
            </p>
            <iframe src="https://dune.com/embeds/4674606/7780357" className="w-full h-[400px] border-1 border-orange-500"/>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">
              Daily TPS
            </p>
            <iframe src="https://dune.com/embeds/4225892/7109149" className="w-full h-[400px] border-1 border-orange-500"/>
          </div>
        </div>
      </div>
    </div>
  );
}

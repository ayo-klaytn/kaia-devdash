/*
  Usage:
    API_SECRET=... BETTER_AUTH_URL=http://localhost:3006 bun tsx scripts/importHackathonRepos.ts
*/

type RepoInput = string;

const RAW_URLS: RepoInput[] = [
  "https://github.com/Aaditya1273/KaiaSIPS",
  "https://github.com/Abdallah640/KaiSave1",
  "https://github.com/Abidoyesimze/YieldCircle",
  "https://github.com/Alperen915/artverse-social-nexus",
  "https://github.com/altaga/EffiSend-Line",
  "https://github.com/Ambyelwa",
  "https://github.com/Ashikhowlader/YieldQuest/tree/main",
  "https://github.com/ayanali0249/Personal-Finance-Dashboard",
  "https://github.com/caelum0x/kaia-stable",
  "https://github.com/blocklinklabs/chat-defi",
  "https://github.com/DIFoundation/TixoraTicket",
  "https://github.com/DODOEX",
  "https://github.com/evoqfinance/genev-web",
  "https://github.com/evoqfinance/genev-contracts",
  "https://github.com/Fillo001/DeFAI-Portfolio-Pilot",
  "https://github.com/Fmsticks2/KayaNest",
  "https://github.com/foundermafstat/nft-dnd",
  "https://github.com/fufuture-option/deployment",
  "https://github.com/gabrielantonyxaviour/mocat_ai",
  "https://github.com/goowoo-company/goowoo-pay-contract",
  "https://github.com/Gemstone-Labs",
  "https://github.com/HappyBerrysBoy/magic-millstone",
  "https://github.com/hassan/domaiNest",
  "https://github.com/Jeongseup/2025-kaia-hackathon-syntekaia-contract",
  "https://github.com/JorLojor/SCALE-kaia-to-kaya-",
  "https://github.com/KAIA2025-REKA/reka-monorepo",
  "https://github.com/kaia-baytamins",
  "https://github.com/Kaia-Cards",
  "https://github.com/kaiapaylance/Kaia_paylance",
  "https://github.com/krishnabandewar/Kaia-LINE-Remittance.git",
  "https://github.com/Lexirieru/movo-kaia",
  "https://github.com/LinaPass",
  "https://github.com/LuckySavings",
  "https://github.com/lucylow/line-yield",
  "https://github.com/MarcusDavidG/kaiavault",
  "https://github.com/Marvy247/SquadSave.git",
  "https://github.com/mygogocash",
  "https://github.com/nikhlu07/S.P.A.R.K",
  "https://github.com/NoLossProtocol",
  "https://github.com/ntfound-dev/KaiaLink",
  "https://github.com/onchainsupply",
  "https://github.com/On-Loan/onloan-v1",
  "https://github.com/PayZoll-Orgs/Kaia-Client",
  "https://github.com/philipjpark/yoree",
  "https://github.com/Prasannaverse13/KaiaGuard-AIAgent",
  "https://github.com/ProjectMerlinDAO",
  "https://github.com/ripe-money",
  "https://github.com/sam-thetutor/wizaai",
  "https://github.com/SenjaLabs",
  "https://github.com/Sentinel-Safe",
  "https://github.com/sneldao/snel",
  "https://github.com/StableStreamHQ",
  "https://github.com/StudioLIQ/inkureme-monorepo",
  "https://github.com/substance-labs/perps-line-miniapp",
  "https://github.com/SwapTokenNFT",
  "https://github.com/tamago-labs/kilolend",
  "https://github.com/TuringM-Labs/TuringM/tree/kaia-0920",
  "https://github.com/west-XE/MediTrack",
  "https://github.com/woogieboogie-jl/kstayble-wallet-kaia-ideathon-monorepo",
  "https://github.com/woonteksolutions/gloyo-kaia-hackathon",
  "https://github.com/WorkWorkLabs/GrowthOS",
  "https://github.com/xxcode2/kaia-defai-earn",
  "https://github.com/yoheinishikubo/aq-monorepo",
  "https://github.com/zoopx-labs",
];

function parseOwnerRepo(u: string): { owner: string; name: string } | null {
  try {
    const url = new URL(u.replace(/\.git$/i, ""));
    if (url.hostname !== 'github.com') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null; // org-only link
    const [owner, name] = parts;
    return { owner, name };
  } catch {
    return null;
  }
}

async function main() {
  const apiBase = process.env.BETTER_AUTH_URL || 'http://localhost:3006';
  const apiSecret = process.env.API_SECRET;
  if (!apiSecret) {
    console.error('Missing API_SECRET');
    process.exit(1);
  }

  const parsed = RAW_URLS.map(parseOwnerRepo).filter(Boolean) as Array<{ owner: string; name: string }>;
  const skipped = RAW_URLS.length - parsed.length;
  console.log(`Parsed ${parsed.length} repositories. Skipped ${skipped} org-only or invalid links.`);

  for (const { owner, name } of parsed) {
    const body = {
      owner,
      name,
      url: `https://github.com/${owner}/${name}`,
      status: 'active',
      remark: 'hackathon-2025'
    };
    try {
      const res = await fetch(`${apiBase}/api/data/repositories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apiSecret': apiSecret },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn(`Failed to add ${owner}/${name}: ${res.status} ${res.statusText} ${text}`);
      } else {
        const json = await res.json();
        console.log(`Added ${owner}/${name}`, json?.[0]?.id || '');
      }
    } catch (e) {
      console.error(`Error adding ${owner}/${name}`, e);
    }
    await new Promise(r => setTimeout(r, 300));
  }
}

main();




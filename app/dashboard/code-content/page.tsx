"use client";
import { useMemo } from 'react';
import kaiaProjects from "@/lib/mocks/kaia-projects.json"
import { Code, BookOpen, Video, ExternalLink, Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
type ProjectData = {
  id?: string | number;
  name?: string;
  maturity_rank?: number;
  community_rank?: number;
  [key: string]: unknown;
};

// Mock data for the three categories - you can replace this with real data
const sampleCodesAndRepos = [
  {
    id: 1,
    name: "MiniDApp SDK Example",
    description: "Example implementation of MiniDApp SDK for building decentralized applications",
    github: "https://github.com/ayo-klaytn/minidapp-sdk-example",
    category: "SDK Development"
  },
  {
    id: 2,
    name: "Kaia Safe API Kit",
    description: "API kit for integrating with Kaia Safe multisig wallet functionality",
    github: "https://github.com/ayo-klaytn/kaia-safe-api-kit",
    category: "Wallet Integration"
  },
  {
    id: 3,
    name: "Kaia Agent Kit",
    description: "Development kit and tools for building AI agents on Kaia network",
    github: "https://github.com/kaiachain/kaia-agent-kit",
    category: "AI Development"
  },
  {
    id: 4,
    name: "Awesome Kaia",
    description: "Curated list of awesome Kaia resources, tools, and projects",
    github: "https://github.com/kaiachain/awesome-kaia",
    category: "Resources"
  },
  {
    id: 5,
    name: "Kaia Gas Abstraction Example",
    description: "Example implementation of gas abstraction on Kaia network",
    github: "https://github.com/ayo-klaytn/kaia-ga-demo-mm",
    category: "Gas Optimization"
  },
  {
    id: 6,
    name: "Kaia GOAT SDK",
    description: "SDK for building and interacting with GOAT (Game On Any Token) on Kaia",
    github: "https://github.com/ayo-klaytn/kaia-goat-sdk",
    category: "Gaming SDK"
  },
  {
    id: 7,
    name: "Build on Kaia Bootcamp",
    description: "Comprehensive bootcamp materials and examples for building on Kaia blockchain",
    github: "https://github.com/kaiachain/build-on-kaia-bootcamp",
    category: "Educational"
  },
  {
    id: 8,
    name: "Kaia Online Toolkit",
    description: "Code examples and web application to help developers utilize the Kaia blockchain and its SDK easily",
    github: "https://github.com/kaiachain/kaia-online-toolkit",
    category: "Development Tools"
  },
  {
    id: 9,
    name: "Kaia RPS",
    description: "Rock Paper Scissors game implementation on Kaia blockchain",
    github: "https://github.com/kaiachain/Kaia-RPS",
    category: "Gaming"
  },
  {
    id: 10,
    name: "Cross-chain OFT V2 Example",
    description: "Example implementation of cross-chain token transfers using LayerZero OFT V2",
    github: "https://github.com/ayo-klaytn/crosschain-oft-v2-example",
    category: "Cross-chain"
  },
  {
    id: 11,
    name: "Hardhat Verify Example",
    description: "Example showing how to verify smart contracts on Kaia using Hardhat",
    github: "https://github.com/ayo-klaytn/hardhat-verify-example",
    category: "Development Tools"
  },
  {
    id: 12,
    name: "Envio ERC20 Indexing Example",
    description: "Example of indexing ERC20 tokens using Envio on Kaia",
    github: "https://github.com/ayo-klaytn/envio-erc20-indexing-example",
    category: "Data Indexing"
  },
  {
    id: 13,
    name: "Kaia CCIP NFT Hardhat Example",
    description: "Complete example of building cross-chain NFTs on Kaia using Chainlink CCIP with Hardhat",
    github: "https://github.com/ayo-klaytn/kaia-ccip-nft-hardhat-example",
    category: "Cross-chain"
  },
];

const technicalWrittenGuides = [
  // Articles
  {
    id: 1,
    name: "Getting Started with Gas Abstraction on Kaia Wallet",
    description: "Learn how to implement gas abstraction features in your Kaia applications",
    url: "https://medium.com/kaiachain/getting-started-with-gas-abstraction-on-kaia-wallet-2fe277995729",
    category: "Gas Abstraction"
  },
  {
    id: 2,
    name: "Deploy an EVM Kaia Bridge in Minutes Without Code",
    description: "Step-by-step guide to deploying cross-chain bridges on Kaia",
    url: "https://medium.com/kaiachain/deploy-an-evm-kaia-bridge-in-minutes-without-code-bc020a4fa17b",
    category: "Cross-chain"
  },
  {
    id: 3,
    name: "How to Token Gate a Unity Game Using ChainSafe and Thirdweb on Kaia",
    description: "Complete tutorial for implementing token-gated gaming mechanics",
    url: "https://medium.com/kaiachain/how-to-token-gate-a-unity-game-using-chainsafe-and-thirdweb-on-kaia-93c574519da2",
    category: "Gaming"
  },
  {
    id: 4,
    name: "Unity Game Development on Kaia: Minting Fungible Tokens with ChainSafe",
    description: "Guide to minting tokens in Unity games on Kaia blockchain",
    url: "https://medium.com/kaiachain/unity-game-development-on-kaia-minting-fungible-tokens-with-chainsafe-beea9022c42d",
    category: "Gaming"
  },
  {
    id: 5,
    name: "Pay for Gas Fees with Any Token: A Deep Dive into Kaia's Trustless Gas Abstraction",
    description: "Technical deep dive into Kaia's innovative gas abstraction system",
    url: "https://medium.com/kaiachain/pay-for-gas-fees-with-any-token-a-deep-dive-into-kaias-trustless-gas-abstraction-d670355a096b",
    category: "Gas Abstraction"
  },
  {
    id: 6,
    name: "How to Use Kaia Toolkit for Platform-level Multisig on Kaia",
    description: "Implementing multisig functionality using Kaia's toolkit",
    url: "https://medium.com/kaiachain/how-to-use-kaia-toolkit-for-platform-level-multisig-on-kaia-645c182027c2",
    category: "Security"
  },
  {
    id: 7,
    name: "How to Access KaiaChain Data Using Kaiascan API",
    description: "Complete guide to using Kaiascan API for blockchain data access",
    url: "https://medium.com/kaiachain/how-to-access-kaiachain-data-using-kaiascan-api-30c56ae0f2ae",
    category: "API Integration"
  },
  {
    id: 8,
    name: "How to Index KIP7 Transfer on Kaia Using Envio QuickNode",
    description: "Tutorial for indexing token transfers using Envio and QuickNode",
    url: "https://medium.com/kaiachain/how-to-index-kip7-transfer-on-kaia-using-envio-quicknode-a3be9b22dea3",
    category: "Data Indexing"
  },
  // Cookbooks
  {
    id: 9,
    name: "Build Mini dApps on LINE with Cocos Creator",
    description: "Complete guide to building mini dApps for LINE platform using Cocos Creator",
    url: "https://docs.kaia.io/minidapps/cocos-creator/",
    category: "Mini dApps"
  },
  {
    id: 10,
    name: "Survey Minidapp Guide",
    description: "Step-by-step guide to creating survey-based mini dApps on Kaia",
    url: "https://docs.kaia.io/minidapps/survey-minidapp/intro/",
    category: "Mini dApps"
  },
  {
    id: 11,
    name: "How to Configure Your Wallet for Kaia Networks",
    description: "Complete wallet configuration guide for Kaia blockchain networks",
    url: "https://docs.kaia.io/build/wallets/wallet-config/configure-wallet-for-kaia-networks/",
    category: "Wallet Setup"
  },
  {
    id: 12,
    name: "Secure Wallet Management on Kaia Chain: A Developer's Cookbook",
    description: "Best practices for secure wallet creation and management on Kaia",
    url: "https://docs.kaia.io/build/wallets/wallet-config/create-and-manage-wallets-securely/",
    category: "Security"
  },
  {
    id: 13,
    name: "How to Send Tokens from Your Kaia Compatible Wallet",
    description: "Tutorial for sending tokens using Kaia-compatible wallets",
    url: "https://docs.kaia.io/build/wallets/wallet-ops/send-tokens-from-your-kaia-compatible-wallet/",
    category: "Wallet Operations"
  },
  {
    id: 14,
    name: "How to Estimate Gas Limits and Prices on Kaia Wallet and MetaMask",
    description: "Guide to accurately estimating gas costs for transactions",
    url: "https://docs.kaia.io/build/wallets/wallet-ops/estimate-gaslimits-prices-on-kaia-wallet-and-metamask/",
    category: "Gas Management"
  },
  {
    id: 15,
    name: "How to Optimize Gas Fees in Solidity Smart Contract",
    description: "Best practices for writing gas-efficient smart contracts on Kaia",
    url: "https://docs.kaia.io/build/transactions/cookbooks/how-to-optimize-gas-fees/",
    category: "Smart Contracts"
  },
  {
    id: 16,
    name: "How to Send ERC-20 Tokens Using the Kaia SDK (USDT Example)",
    description: "Practical example of sending USDT tokens using Kaia SDK",
    url: "https://docs.kaia.io/build/tutorials/how-to-send-usdt-tokens-using-kaia-sdk/",
    category: "Token Operations"
  },
  {
    id: 17,
    name: "Integrate Kaia Fee Delegation Service",
    description: "Guide to implementing fee delegation in your applications",
    url: "https://docs.kaia.io/build/tutorials/integrate-fee-delegation-service/",
    category: "Fee Delegation"
  },
  {
    id: 18,
    name: "Developer Guide: Integrating Kaia Gas Abstraction (GA)",
    description: "Complete developer guide for implementing gas abstraction",
    url: "https://docs.kaia.io/build/tutorials/ga-tutorial/",
    category: "Gas Abstraction"
  },
  {
    id: 19,
    name: "Agent Kit Integration Guide",
    description: "Step-by-step guide to integrating Kaia Agent Kit in your projects",
    url: "https://docs.kaia.io/build/tools/kaia-agentkit/",
    category: "AI Development"
  },
  {
    id: 20,
    name: "Gaming SDK Guides",
    description: "Comprehensive guides for building games on Kaia using gaming SDKs",
    url: "https://docs.kaia.io/build/tools/gaming-sdks/",
    category: "Gaming"
  },
  {
    id: 21,
    name: "Team Finance Integration Guide",
    description: "Guide to integrating Team Finance for token management",
    url: "https://docs.kaia.io/build/tools/token-management/team-finance/",
    category: "Token Management"
  },
  {
    id: 22,
    name: "Building Cross-Chain NFTs on Kaia with Chainlink CCIP",
    description: "Complete guide to building cross-chain NFTs using Chainlink CCIP with burn-and-mint model",
    url: "https://medium.com/kaiachain/building-cross-chain-nfts-on-kaia-with-chainlink-ccip-01899773a29b",
    category: "Cross-chain"
  }
];

const technicalVideoGuides = [
  {
    id: 1,
    name: "How to use CSV Airdrop Tool in Kaia Safe",
    description: "Learn how to perform bulk token airdrops using Kaia Safe's CSV tool",
    url: "https://youtu.be/O9fDgx9aYik?si=lfNepBaqaQFF9460",
    duration: "YouTube",
    category: "Token Management"
  },
  {
    id: 2,
    name: "Deploy an EVM <-> Kaia Bridge in Minutes - Without Code",
    description: "Step-by-step guide to deploying cross-chain bridges without coding",
    url: "https://youtu.be/_DU41uVMn5U?si=HTLIwZVvr4ObowMP",
    duration: "YouTube",
    category: "Cross-chain"
  },
  {
    id: 3,
    name: "Mini Dapps on LINE powered by Kaiachain",
    description: "Learn how to build mini dApps for LINE platform using Kaia blockchain",
    url: "https://x.com/oxpam_pam/status/1884843790453596366?s=46&t=fyN9N1cRQVb3au363robMw",
    duration: "X/Twitter",
    category: "Mini dApps"
  },
  {
    id: 4,
    name: "How to access blockchain data on Kaia using KaiaScan API",
    description: "Tutorial on retrieving blockchain data using KaiaScan API endpoints",
    url: "https://x.com/oxpam_pam/status/1882316998325272761?s=46&t=fyN9N1cRQVb3au363robMw",
    duration: "X/Twitter",
    category: "API Integration"
  },
  {
    id: 5,
    name: "How to set up a Multi-sig Wallet on Kaia using Kaia Safe",
    description: "Complete guide to creating and managing multisig wallets on Kaia",
    url: "https://x.com/oxpam_pam/status/1877989480419807384?s=46&t=fyN9N1cRQVb3au363robMw",
    duration: "X/Twitter",
    category: "Security"
  },
  {
    id: 6,
    name: "How to connect your smart contract on Kaia to real world data using oracles - Pyth Network",
    description: "Integrate Pyth Network oracles to access real-world data in your smart contracts",
    url: "https://x.com/oxpam_pam/status/1863652853853593624?s=46&t=fyN9N1cRQVb3au363robMw",
    duration: "X/Twitter",
    category: "Oracles"
  },
  {
    id: 7,
    name: "Getting started with Kaia SDK",
    description: "Introduction to Kaia SDK and how to get started with development",
    url: "https://x.com/oxpam_pam/status/1867602535265038497?s=46&t=fyN9N1cRQVb3au363robMw",
    duration: "X/Twitter",
    category: "Getting Started"
  },
  {
    id: 8,
    name: "llms.txt on Kaia Docs",
    description: "Learn about llms.txt implementation in Kaia documentation",
    url: "https://x.com/oxpam_pam/status/1905144420040581517?s=46&t=fyN9N1cRQVb3au363robMw",
    duration: "X/Twitter",
    category: "Documentation"
  },
  {
    id: 9,
    name: "Introducing Kaia Toolkit",
    description: "Overview and introduction to the comprehensive Kaia development toolkit",
    url: "https://x.com/oxpam_pam/status/1904917822955741310?s=46&t=fyN9N1cRQVb3au363robMw",
    duration: "X/Twitter",
    category: "Development Tools"
  },
  {
    id: 10,
    name: "Building AI Agents on Kaia using GOAT SDK + Vercel AI Framework",
    description: "Complete tutorial on building AI agents using GOAT SDK and Vercel AI Framework",
    url: "https://x.com/oxpam_pam/status/1897537720093745482?s=46&t=fyN9N1cRQVb3au363robMw",
    duration: "X/Twitter",
    category: "AI Development"
  }
];

export default function CodeContentPage() {
  const data = useMemo(() => kaiaProjects as ProjectData[], []);

  void useMemo(
    () => ({
      totalProjects: data.length,
      maturedProjects: data.filter(project => Number(project.maturity_rank ?? 0) >= 3).length,
      activeProjects: data.filter(project => Number(project.community_rank ?? 0) >= 3).length,
    }),
    [data]
  );

  const kpiCards = [
    {
      value: sampleCodesAndRepos.length,
      label: "Code Samples",
      delta: "+4 QoQ",
      sublabel: "Published this year",
      icon: Code,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
      gradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
    },
    {
      value: technicalWrittenGuides.length,
      label: "Technical Guides",
      delta: "+7 YoY",
      sublabel: "Articles & tutorials this year",
      icon: BookOpen,
      iconColor: "text-green-600",
      iconBg: "bg-green-50 dark:bg-green-950/20",
      gradient: "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
    },
    {
      value: technicalVideoGuides.length,
      label: "Video Guides",
      delta: "+3 last 90d",
      sublabel: "Videos released this year",
      icon: Video,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/20",
      gradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Code & Content</h1>
        <p className="text-muted-foreground">
          Explore sample codes, technical guides, and video tutorials for Kaia development
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index}
              className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-0 shadow-sm"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <span className="text-xs font-medium text-green-600">{card.delta}</span>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight mb-1">{card.value}</h2>
                    <p className="text-xs text-muted-foreground">{card.sublabel}</p>
                  </div>
                  <div className={`${card.iconBg} p-3 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sample Codes and Repos */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Sample Codes and Repos</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Open source examples and sample implementations ({sampleCodesAndRepos.length} total)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleCodesAndRepos.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm flex-1">{item.name}</h3>
                  <a 
                    href={item.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0 ml-2"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Written Guides */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Technical Written Guides</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Comprehensive documentation and step-by-step tutorials ({technicalWrittenGuides.length} total)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicalWrittenGuides.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm flex-1">{item.name}</h3>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0 ml-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 px-2 py-1 rounded font-medium">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Video Guides */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Technical Video Guides</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Video tutorials and workshops for hands-on learning ({technicalVideoGuides.length} total)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicalVideoGuides.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm flex-1">{item.name}</h3>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0 ml-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400 px-2 py-1 rounded font-medium">{item.category}</span>
                  <span className="text-xs text-muted-foreground">{item.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



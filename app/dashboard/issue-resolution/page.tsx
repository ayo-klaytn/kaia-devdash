import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, MessageSquare, Wrench, CheckCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function IssueResolutionPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Issue Resolution</h1>
        <p className="text-muted-foreground">
          Developer issues that led to improved DevEx and community support
        </p>
      </div>

      {/* Dev Issues that led to improved DevEx */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Dev Issues that led to improved DevEx
          </CardTitle>
          <CardDescription>
            Issues reported by developers that resulted in documentation improvements and fixes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gas estimate error issues */}
          <div className="border-l-4 border-primary pl-4 py-2 rounded-r-lg hover:bg-muted/30 transition-colors">
            <h3 className="font-semibold text-lg mb-3">Gas estimate error issues while deploying</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground">Source:</span>
                <a 
                  href="https://discord.com/channels/951136974155153469/1239757971681050654/1368774270100050061" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Discord Thread <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground">Fixed on Kaia Docs:</span>
                <a 
                  href="https://docs.kaia.io/build/smart-contracts/deployment-and-verification/deploy/foundry/#troubleshooting" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Foundry Troubleshooting Guide <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Canonical WKLAY updated to WKAIA */}
          <div className="border-l-4 border-green-500 pl-4 py-2 rounded-r-lg hover:bg-muted/30 transition-colors">
            <h3 className="font-semibold text-lg mb-3">Canonical WKLAY updated to WKAIA</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground">Source:</span>
                <a 
                  href="https://kaiafoundation.slack.com/archives/C08UJSY0TQU/p1755136048774649?thread_ts=1750836289.099069&cid=C08UJSY0TQU" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Slack Thread <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground">Fixed on Kaia Docs:</span>
                <a 
                  href="https://docs.kaia.io/build/smart-contracts/token-development/canonical-wkaia/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Canonical WKAIA Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground">Medium Article:</span>
                <a 
                  href="https://medium.com/kaiachain/update-on-canonical-wrapped-token-wklay-is-now-wkaia-942e29de9190" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Update on Canonical Wrapped Token <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dev Questions on Discord Answered */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Dev Questions on Discord Answered
          </CardTitle>
          <CardDescription>
            Community questions that were successfully resolved through Discord support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Migrating endpoint-node from Klaytn to Kaia</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239757971681050654/1275679632926179388" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Disk space usage for running node</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239757971681050654/1284102931247009842" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Enabling state-live-pruning</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239757971681050654/1285887727811690613" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Do we have to update Kaia v1.0.3</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239757971681050654/1289086582883749960" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Contract verification in Foundry CLI for Kaia</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239757971681050654/1346858332253585488" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">How to get Kaia Balance</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239757971681050654/1348933940441780307" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Which RPC works best</p>
                  <div className="flex gap-2 mt-1">
                    <a 
                      href="https://discord.com/channels/951136974155153469/1239757971681050654/1361321174658973917" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                    >
                      Answer 1 <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href="https://discord.com/channels/951136974155153469/1239757971681050654/1362308823758409819" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                    >
                      Answer 2 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Size of an Archival node</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239757971681050654/1362589233604333658" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Gas estimation error while deploying on Kaia network using Foundry</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239757971681050654/1368849252658450453" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Available Grants</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239757971681050654/1412435662464094300" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Kaiascope shutdown spotlight to a developer issue</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239758041944162354/1391637458831282217" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Verifying contracts on Remix</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239758041944162354/1388934776404312216" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover:shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Bootnode address</p>
                  <a 
                    href="https://discord.com/channels/951136974155153469/1239758139826507796/1397096026103615631" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Answer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
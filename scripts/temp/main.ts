import { getGithubMetricsForDevRelRepo } from './lib';

async function main() {
  await getGithubMetricsForDevRelRepo();
}

main().catch(console.error);
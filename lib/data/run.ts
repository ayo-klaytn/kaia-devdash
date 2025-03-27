import { test } from './github-data-processor';

async function main() {
  await test();
}

main().catch(console.error);
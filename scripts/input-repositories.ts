import fs from 'fs';

export async function convertTomlToJson() {
  const tomlContent = fs.readFileSync('scripts/kaia.toml', 'utf-8');

  // Parse sub_ecosystems
  const subEcosystemsMatch = tomlContent.match(/sub_ecosystems = \[([\s\S]*?)\]/);
  if (!subEcosystemsMatch) throw new Error('Could not find sub_ecosystems section');
  const subEcosystems = subEcosystemsMatch[1]
    .split('\n')
    .filter(line => line.includes('"'))
    .map(line => line.trim().replace(/"/g, '').replace(/,/g, ''));

  // Parse github_organizations
  const githubOrgsMatch = tomlContent.match(/github_organizations = \[([\s\S]*?)\]/);
  if (!githubOrgsMatch) throw new Error('Could not find github_organizations section');
  const githubOrgs = githubOrgsMatch[1]
    .split('\n')
    .filter(line => line.includes('"'))
    .map(line => line.trim().replace(/"/g, '').replace(/,/g, ''));

  // Parse repositories
  const repoMatches = tomlContent.match(/\[\[repo\]\]\nurl = "(.+?)"/g);
  if (!repoMatches) throw new Error('Could not find repository entries');
  
  const repos = repoMatches.map((match, index) => {
    const urlMatch = match.match(/url = "(.+?)"/);
    if (!urlMatch) throw new Error(`Could not parse URL from repository entry ${index + 1}`);
    
    const repoMatch = urlMatch[1].match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!repoMatch) throw new Error(`Invalid GitHub URL format in entry ${index + 1}`);
    
    const [, owner, repository] = repoMatch;
    return {
      id: index + 1,
      owner,
      repository
    };
  });

  const jsonContent = {
    sub_ecosystems: subEcosystems,
    github_organizations: githubOrgs,
    repositories: repos
  };

  fs.writeFileSync('scripts/kaia.json', JSON.stringify(jsonContent, null, 2));
  console.log('Successfully created kaia.json');
}

export async function fromJsonToCallApi() {
  const jsonContent = fs.readFileSync('scripts/kaia.json', 'utf-8');
  const data = JSON.parse(jsonContent);

  try {
    for (const repo of data.repositories) {
      await fetch('http://localhost:3006/api/data/repositories', {
        method: 'POST',
        body: JSON.stringify({
          owner: repo.owner,
          repository: repo.repository
        }),
        headers: {
          'Content-Type': 'application/json',
          'apiSecret': process.env.API_SECRET || ''
        }
      });
    }
  } catch (error) {
    console.error('Error calling API:', error);
  }
}


fromJsonToCallApi();
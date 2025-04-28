import fs from "fs";

async function migrate() {
  const NODE_ENV = process.env.NODE_ENV;
  let hostUrl;

  if (NODE_ENV === "development") {
    hostUrl = "http://localhost:3006";
  } else {
    hostUrl = "https://devdash.kaia.io";
  }

  const jsonContent = fs.readFileSync("scripts/kaia.json", "utf-8");
  const jsonData = JSON.parse(jsonContent);
  const subEcosystems = jsonData.sub_ecosystems;
  const githubOrganizations = jsonData.github_organizations;

  for (const subEcosystem of subEcosystems) {
    const newSubEcosystem = {
      name: subEcosystem,
    };

    console.log(newSubEcosystem);

    const response = await fetch(`${hostUrl}/api/data/sub-ecosystems`, {
      method: "POST",
      body: JSON.stringify(newSubEcosystem),
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!,
      },
    });

    console.log(response);
  }

  for (const githubOrganization of githubOrganizations) {
    const newGithubOrganization = {
      username: githubOrganization.split("/").pop(),
      url: githubOrganization,
    };

    console.log(newGithubOrganization);

    const response = await fetch(`${hostUrl}/api/data/github-organizations`, {
      method: "POST",
      body: JSON.stringify(newGithubOrganization),
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!,
      },
    });

    console.log(response);
  }
}

migrate();

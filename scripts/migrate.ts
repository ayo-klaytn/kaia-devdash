async function migrate() {
  const hostUrl = "http://localhost:3006";
  const prodHostUrl = "https://devdash.kaia.io";

  const devRepositories = await fetch(`${hostUrl}/api/data/repositories?page=1&limit=1000&status=active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  const devRepositoriesData = await devRepositories.json();
  
  const prodRepositories = await fetch(`${prodHostUrl}/api/data/repositories?page=1&limit=1000&status=active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  const prodRepositoriesData = await prodRepositories.json();

  const devRepositoryStats = await fetch(`${hostUrl}/api/data/repository-stats?page=1&limit=1000`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  const devRepositoryStatsData = await devRepositoryStats.json();


  for (const devRepo of devRepositoriesData) {
    // find the corresponding repository stats

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const devRepoStats = devRepositoryStatsData.find(
      (rs: any) => rs.repositoryId === devRepo.id
    );

    // find the corresponding repository

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prodRepo = prodRepositoriesData.find(
      (pr: any) => pr.owner === devRepo.owner && pr.name === devRepo.name
    );

    const newRepositoryStats = await fetch(`${prodHostUrl}/api/data/repository-stats`, {
      method: "POST",
      body: JSON.stringify({
        stars: devRepoStats.stars,
        forks: devRepoStats.forks,
        watchers: devRepoStats.watchers,
        repositoryId: prodRepo.id,
      }),
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!,
      },
    });

    const newRepositoryStatsData = await newRepositoryStats.json();

    console.log(newRepositoryStatsData);
  }
}

migrate();
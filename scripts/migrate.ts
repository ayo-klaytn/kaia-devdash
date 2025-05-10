async function migrate() {
  const hostUrl = "http://localhost:3006";
  // const prodHostUrl = "https://devdash.kaia.io"; 

  const devRepositoryStats = await fetch(`${hostUrl}/api/data/repository-stats?page=1&limit=800`, {
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  const devRepositoryStatsData = await devRepositoryStats.json();

  for (const repository of devRepositoryStatsData) {
    const repositoryId = repository.repositoryId;

    const updateRepository = await fetch(`${hostUrl}/api/data/repositories`, {
      method: "PATCH",
      body: JSON.stringify({
        id: repositoryId,
        status: "active",
      }),
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!,
      },
    });

    const updateRepositoryData = await updateRepository.json();

    console.log(updateRepositoryData);
  }
}

migrate();
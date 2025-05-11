export async function deleteStats() {
  // const hostUrl = "http://localhost:3006";
  const prodHostUrl = "https://devdash.kaia.io";
  const repositoryStats = await fetch(`${prodHostUrl}/api/data/repository-stats?page=1&limit=1000`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  const repositoryStatsData = await repositoryStats.json();

  for (const repoStat of repositoryStatsData) {
    await fetch(`${prodHostUrl}/api/data/repository-stats/${repoStat.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!,
      },
    });
  }

  console.log(repositoryStatsData);
}

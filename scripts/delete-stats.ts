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
    
    console.log(repoStat);
    console.log(repoStat.repositoryId);
    const response = await fetch(`${prodHostUrl}/api/data/repository-stats`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!,
      },
      body: JSON.stringify({
        id: repoStat.id,
      }),
    });

    const responseData = await response.json();

    console.log(responseData);
  }
}

deleteStats();
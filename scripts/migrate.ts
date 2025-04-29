async function migrate() {
  const hostUrl = "http://localhost:3006";
  const prodHostUrl = "https://devdash.kaia.io";

  const devStats = await fetch(`${hostUrl}/api/data/repository-stats?page=1&limit=800`, {
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  const devStatsData = await devStats.json();

  const prodStats = await fetch(`${prodHostUrl}/api/data/repository-stats?page=1&limit=800`, {
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  const prodStatsData = await prodStats.json();

  for (const stat of devStatsData) {

    const response = await fetch(`${prodHostUrl}/api/data/repository-stats`, {
      method: "POST",
      body: JSON.stringify({
        repositoryId: stat.repositoryId,
        stars: stat.stars,
        forks: stat.forks,
        watchers: stat.watchers,
      }),
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!,
      },
    });
    const data = await response.json();
    console.log(data);
  }
}

migrate();
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
  

  for (const devRepo of devRepositoriesData) {
    const prodRepo = (prodRepositoriesData as any).find(
      (pr: any) => pr.owner === devRepo.owner && pr.name === devRepo.name
    );

    if (prodRepo) {
      const updateRepository = await fetch(`${prodHostUrl}/api/data/repositories`, {
        method: "PATCH",
        body: JSON.stringify({
          id: prodRepo.id,
          url: devRepo.url,
          status: "active",
          remark: "external"
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
}

migrate();
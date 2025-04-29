async function fixGithubLink() {
  const hostUrl = process.env.BETTER_AUTH_URL;

  const repositories = await fetch(`${hostUrl}/api/data/repositories?page=1&limit=1000`, {
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  const repositoriesData = await repositories.json();

  for (const repository of repositoriesData) {
    const repositoryId = repository.id;
    const owner = repository.owner;
    const name = repository.name;
    const newUrl = `https://github.com/${owner}/${name}`;

    console.log('New URL:', newUrl);
    const updateRepository = await fetch(`${hostUrl}/api/data/repositories`, {
      method: "PATCH",
      body: JSON.stringify({
        id: repositoryId,
        url: newUrl,
        status: "inactive",
        remark: "external",
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

fixGithubLink();
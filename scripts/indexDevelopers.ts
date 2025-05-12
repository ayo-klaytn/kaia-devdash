export async function indexOwnerOfRepositories() {
  const developers = await fetch(`http://localhost:3006/api/data/developers?page=1&perPage=1000`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!
    }
  });
  const developersData = await developers.json();

  for (const developer of developersData) {
    const repositories = await fetch(`http://localhost:3006/api/data/repositories?owner=${developer.name}&status=active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!
      }
    });
    const repositoriesData = await repositories.json();
    console.log("Repositories:", repositoriesData);

    // insert the id of the repository into the ownerOfRepositories object
    const ownerOfRepositories = [];
    for (const repository of repositoriesData) {
      ownerOfRepositories.push(repository.id);
    }

    const response = await fetch(`http://localhost:3006/api/data/developers`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!
      },
      body: JSON.stringify({
        id: developer.id,
        ownerOf: ownerOfRepositories
      })
    });

    const responseData = await response.json();
    console.log("Response:", responseData);
  }
}

indexOwnerOfRepositories();